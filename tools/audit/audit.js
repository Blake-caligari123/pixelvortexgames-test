#!/usr/bin/env node
/*
 * Patchwell audit engine.
 * Usage: node audit.js --client "Store Name" --out ./reports/store URL [URL ...]
 * Produces report.json + report.html (+ screenshots) in --out.
 *
 * Automated layer only. Every client report also gets a manual review pass
 * (see ../../ops/DELIVERY.md) before it is delivered.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const AXE_SRC = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const FIXES = require('./fixes.js');

const OVERLAYS = [ // matched against loaded script URLs only
  ['accessiBe', /acsbapp\.com|accessibe\.com/i], ['UserWay', /cdn\.userway\.org/i], ['AudioEye', /audioeye\.com/i],
  ['EqualWeb', /equalweb\.com|nagich\.co/i], ['Max Access', /maxaccess\.io/i], ['Accessibly', /accessiblyapp\.com|otm-r\.com/i],
  ['Sienna', /sienna(\.min)?\.js|sienna-accessibility/i], ['Elfsight', /elfsightcdn\.com.*accessib/i], ['Accesimo', /accesimo/i],
];

function parseArgs(argv) {
  const a = { urls: [], out: './report', client: 'Website' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out') a.out = argv[++i];
    else if (argv[i] === '--client') a.client = argv[++i];
    else a.urls.push(argv[i]);
  }
  if (!a.urls.length) { console.error('usage: node audit.js [--client NAME] [--out DIR] URL...'); process.exit(2); }
  return a;
}

async function runAxe(page) {
  await page.addScriptTag({ content: AXE_SRC });
  return page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      resultTypes: ['violations', 'incomplete'],
    });
    const slim = (v) => ({ id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, tags: v.tags,
      nodes: v.nodes.slice(0, 25).map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 300), summary: (n.failureSummary || '').slice(0, 400) })),
      count: v.nodes.length });
    return { violations: r.violations.map(slim), incomplete: r.incomplete.map(slim) };
  });
}

async function keyboardCheck(page) {
  // Tab through the page, recording what gets focus and whether focus is visible.
  await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement) document.activeElement.blur(); });
  const stops = [], seen = new Set();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const shadow = cs.boxShadow && cs.boxShadow !== 'none';
      const label = (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || '').trim().slice(0, 60);
      let sel = el.tagName.toLowerCase();
      if (el.id) sel += '#' + el.id; else if (el.classList.length) sel += '.' + [...el.classList].slice(0, 2).join('.');
      return { sel, label, tag: el.tagName, href: el.getAttribute('href') || '', visibleIndicator: outline || shadow,
        offscreen: r.width < 2 || r.height < 2 || r.bottom < -5 || r.right < -5 || cs.visibility === 'hidden' || cs.opacity === '0' };
    });
    if (!info) continue;
    const k = info.sel + '|' + info.label + '|' + info.href;
    if (seen.has(k)) break; // focus has cycled
    seen.add(k);
    stops.push(info);
  }
  const skipLink = stops.slice(0, 3).some((s) => s.tag === 'A' && /^#/.test(s.href) && /skip|main|content/i.test(s.label));
  const noIndicator = stops.filter((s) => !s.visibleIndicator && !s.offscreen);
  const hiddenFocus = stops.filter((s) => s.offscreen && !/skip/i.test(s.label));
  return { stops: stops.length, skipLink, noIndicator: noIndicator.slice(0, 15), noIndicatorCount: noIndicator.length, hiddenFocus: hiddenFocus.slice(0, 10), hiddenFocusCount: hiddenFocus.length };
}

async function reflowCheck(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } });
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: 'load', timeout: 45000 });
    await p.waitForTimeout(1500);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    return { scrollWidth: w, fails: w > 330 };
  } catch (e) { return { error: e.message }; } finally { await ctx.close(); }
}

async function auditUrl(browser, url, outDir, idx) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const scripts = [];
  page.on('request', (r) => { if (r.resourceType() === 'script') scripts.push(r.url()); });
  const res = { url, ok: true };
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2500);
    res.title = await page.title();
    res.lang = await page.evaluate(() => document.documentElement.lang || '');
    const shot = `page-${idx + 1}.png`;
    await page.screenshot({ path: path.join(outDir, shot) });
    res.screenshot = shot;
    res.axe = await runAxe(page);
    res.keyboard = await keyboardCheck(page);
    res.overlays = OVERLAYS.filter(([, re]) => scripts.some((s) => re.test(s))).map(([n]) => n);
  } catch (e) { res.ok = false; res.error = e.message; }
  await ctx.close();
  if (res.ok) res.reflow = await reflowCheck(browser, url);
  return res;
}

const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function aggregate(pages) {
  const byRule = new Map();
  for (const p of pages) {
    if (!p.ok) continue;
    for (const v of p.axe.violations) {
      if (!byRule.has(v.id)) byRule.set(v.id, { ...v, pages: [], total: 0, examples: [] });
      const r = byRule.get(v.id);
      r.pages.push(p.url); r.total += v.count;
      for (const n of v.nodes) if (r.examples.length < 6) r.examples.push({ ...n, url: p.url });
    }
  }
  // custom findings expressed as pseudo-rules so they flow through the same report
  const custom = [];
  const kbNo = pages.filter((p) => p.ok && p.keyboard.noIndicatorCount > 0);
  if (kbNo.length) custom.push({ id: 'pw-focus-visible', impact: 'serious', help: 'Keyboard focus is not visible on some interactive elements (WCAG 2.4.7)', pages: kbNo.map((p) => p.url), total: kbNo.reduce((a, p) => a + p.keyboard.noIndicatorCount, 0), examples: kbNo.flatMap((p) => p.keyboard.noIndicator.slice(0, 3).map((s) => ({ target: s.sel, html: s.label, url: p.url }))).slice(0, 6) });
  const kbHidden = pages.filter((p) => p.ok && p.keyboard.hiddenFocusCount > 0);
  if (kbHidden.length) custom.push({ id: 'pw-focus-hidden', impact: 'serious', help: 'Keyboard focus lands on elements that are invisible or off-screen (WCAG 2.4.7 / 2.4.11)', pages: kbHidden.map((p) => p.url), total: kbHidden.reduce((a, p) => a + p.keyboard.hiddenFocusCount, 0), examples: kbHidden.flatMap((p) => p.keyboard.hiddenFocus.slice(0, 3).map((s) => ({ target: s.sel, html: s.label, url: p.url }))).slice(0, 6) });
  const noSkip = pages.filter((p) => p.ok && !p.keyboard.skipLink);
  if (noSkip.length) custom.push({ id: 'pw-skip-link', impact: 'moderate', help: 'No "Skip to content" link in the first few Tab stops (WCAG 2.4.1)', pages: noSkip.map((p) => p.url), total: noSkip.length, examples: [] });
  const reflow = pages.filter((p) => p.ok && p.reflow && p.reflow.fails);
  if (reflow.length) custom.push({ id: 'pw-reflow', impact: 'serious', help: 'Content scrolls sideways at 320px width / 400% zoom (WCAG 1.4.10)', pages: reflow.map((p) => p.url), total: reflow.length, examples: reflow.map((p) => ({ target: 'document', html: `page is ${p.reflow.scrollWidth}px wide at a 320px viewport`, url: p.url })) });
  const overlays = [...new Set(pages.flatMap((p) => p.overlays || []))];
  if (overlays.length) custom.push({ id: 'pw-overlay', impact: 'moderate', help: `Accessibility overlay widget detected (${overlays.join(', ')}); overlays do not fix underlying code`, pages: pages.filter((p) => (p.overlays || []).length).map((p) => p.url), total: overlays.length, examples: [] });

  return [...byRule.values(), ...custom].sort((a, b) => (IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]) || (b.total - a.total));
}

function renderHtml(client, pages, rules, date) {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  rules.forEach((r) => { counts[r.impact] = (counts[r.impact] || 0) + 1; });
  const totalInstances = rules.reduce((a, r) => a + r.total, 0);
  const ruleHtml = rules.map((r, i) => {
    const fix = FIXES[r.id] || FIXES._default(r);
    return `<section class="rule ${r.impact}">
  <h3><span class="badge">${esc(r.impact)}</span> ${i + 1}. ${esc(fix.title || r.help)}</h3>
  <p class="meta">${r.total} instance(s) on ${new Set(r.pages).size} of ${pages.filter((p) => p.ok).length} page(s)${r.helpUrl ? ` · <a href="${esc(r.helpUrl)}">rule reference</a>` : ''}${fix.wcag ? ` · WCAG ${esc(fix.wcag)}` : ''}</p>
  <p><strong>Who this affects:</strong> ${esc(fix.who || 'People using assistive technology.')}</p>
  ${r.examples.length ? `<details open><summary>Where we found it</summary><ul class="ex">${r.examples.map((e) => `<li><code>${esc(e.target)}</code><br><span class="snip">${esc(e.html)}</span><br><small>${esc(e.url)}</small></li>`).join('')}</ul></details>` : ''}
  <p><strong>How to fix:</strong> ${fix.how || esc(r.help)}</p>
  ${fix.code ? `<pre><code>${esc(fix.code)}</code></pre>` : ''}
</section>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Accessibility report: ${esc(client)}</title>
<style>
:root{--bg:#fff;--fg:#1d2433;--muted:#5b6478;--line:#e3e6ee;--crit:#b42318;--ser:#c4320a;--mod:#a15c07;--min:#475467;--acc:#1849a9}
@media (prefers-color-scheme:dark){:root{--bg:#10141d;--fg:#e8ebf2;--muted:#9aa3b5;--line:#283043;--crit:#ff8a80;--ser:#ffb37a;--mod:#f5c86a;--min:#b7c0d1;--acc:#8fb3ff}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}main{max-width:900px;margin:0 auto;padding:32px 16px 64px}
h1{font-size:2rem;margin:0 0 4px}a{color:var(--acc)}.muted,.meta{color:var(--muted)}.meta{font-size:.9rem;margin:-4px 0 8px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:24px 0}.card{border:1px solid var(--line);border-radius:10px;padding:14px}.card b{display:block;font-size:1.7rem}
.rule{border:1px solid var(--line);border-left:5px solid var(--min);border-radius:10px;padding:14px 18px;margin:14px 0}.rule h3{margin:0 0 6px;font-size:1.1rem}
.critical{border-left-color:var(--crit)}.serious{border-left-color:var(--ser)}.moderate{border-left-color:var(--mod)}
.badge{font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;border:1px solid currentColor;border-radius:999px;padding:1px 8px;vertical-align:middle}
.critical .badge{color:var(--crit)}.serious .badge{color:var(--ser)}.moderate .badge{color:var(--mod)}.minor .badge{color:var(--min)}
pre{background:rgba(127,127,127,.12);padding:12px;border-radius:8px;overflow:auto;font-size:.85rem}code{font-size:.88em;word-break:break-word}.snip{font-family:ui-monospace,monospace;font-size:.8rem;color:var(--muted);word-break:break-all}
ul.ex{padding-left:18px}ul.ex li{margin:6px 0}table{border-collapse:collapse;width:100%;font-size:.9rem}td,th{border-bottom:1px solid var(--line);padding:6px;text-align:left;vertical-align:top}
.note{border:1px solid var(--line);border-radius:10px;padding:12px 16px;color:var(--muted);font-size:.9rem}
</style></head><body><main>
<p class="muted">Accessibility audit · WCAG 2.2 Level AA · ${esc(date)}</p>
<h1>${esc(client)}</h1>
<div class="cards">
<div class="card"><b>${counts.critical}</b>critical issue types</div><div class="card"><b>${counts.serious}</b>serious</div>
<div class="card"><b>${counts.moderate}</b>moderate</div><div class="card"><b>${counts.minor}</b>minor</div><div class="card"><b>${totalInstances}</b>total instances</div></div>
<h2>Pages reviewed</h2><table><tr><th>Page</th><th>Issue types</th><th>Keyboard stops</th><th>320px reflow</th></tr>
${pages.map((p) => p.ok ? `<tr><td><a href="${esc(p.url)}">${esc(p.title || p.url)}</a></td><td>${p.axe.violations.length}</td><td>${p.keyboard.stops}${p.keyboard.skipLink ? ', has skip link' : ''}</td><td>${p.reflow && p.reflow.fails ? 'fails' : 'ok'}</td></tr>` : `<tr><td>${esc(p.url)}</td><td colspan="3">could not load: ${esc(p.error)}</td></tr>`).join('')}
</table>
<h2>Issues, most urgent first</h2>
${ruleHtml || '<p>No automated issues found. The manual review section below still applies.</p>'}
<h2>Manual review</h2>
<div id="manual" class="note">MANUAL_REVIEW_PLACEHOLDER</div>
<h2>About this report</h2>
<p class="note">This report combines automated testing (axe-core rules, keyboard traversal, 320px reflow, overlay detection) with a manual review of the pages listed. Automated tools find roughly a third to a half of accessibility problems, which is why the manual section matters. This is a technical assessment, not legal advice, and no audit can guarantee that a business will not receive a legal claim. Fixing the issues above meaningfully reduces barriers for disabled customers and is the strongest good-faith step a business can take.</p>
</main></body></html>`;
}

(async () => {
  const args = parseArgs(process.argv);
  fs.mkdirSync(args.out, { recursive: true });
  const browser = await chromium.launch();
  const pages = [];
  for (let i = 0; i < args.urls.length; i++) {
    process.stderr.write(`auditing ${args.urls[i]}\n`);
    pages.push(await auditUrl(browser, args.urls[i], args.out, i));
  }
  await browser.close();
  const rules = aggregate(pages);
  const date = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(args.out, 'report.json'), JSON.stringify({ client: args.client, date, pages, rules }, null, 2));
  fs.writeFileSync(path.join(args.out, 'report.html'), renderHtml(args.client, pages, rules, date));
  const c = rules.reduce((a, r) => (a[r.impact] = (a[r.impact] || 0) + 1, a), {});
  console.log(JSON.stringify({ out: args.out, pages: pages.length, failedPages: pages.filter((p) => !p.ok).length, issueTypes: rules.length, byImpact: c, overlays: [...new Set(pages.flatMap((p) => p.overlays || []))] }));
})();
