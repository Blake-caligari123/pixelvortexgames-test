/* Patchwell free checker. Runs entirely in the visitor's browser on the page they're viewing; nothing is sent anywhere. */
(function () {
  'use strict';
  if (window.__patchwell) { window.__patchwell.remove(); window.__patchwell = null; return; }
  var AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
  var SITE = (document.currentScript && document.currentScript.dataset.site) || 'https://patchwell.example';
  var host = document.createElement('div');
  host.setAttribute('style', 'all:initial;position:fixed;top:12px;right:12px;z-index:2147483647;');
  var root = host.attachShadow({ mode: 'open' });
  root.innerHTML = '<style>' +
    '.p{width:min(380px,calc(100vw - 24px));max-height:80vh;overflow:auto;background:#fff;color:#1d2433;font:14px/1.5 system-ui,sans-serif;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.3);padding:16px}' +
    'h2{font-size:16px;margin:0 0 8px}.x{float:right;border:0;background:none;font-size:20px;cursor:pointer;color:#5b6478}' +
    '.n{display:flex;gap:8px;margin:10px 0}.n div{flex:1;border:1px solid #e3e6ee;border-radius:8px;padding:8px;text-align:center}.n b{display:block;font-size:20px}' +
    'li{margin:6px 0}.c{color:#b42318}.s{color:#c4320a}.m{color:#a15c07}a{color:#1849a9}.cta{display:block;margin-top:12px;padding:10px;border-radius:8px;background:#1849a9;color:#fff;text-align:center;text-decoration:none;font-weight:600}' +
    '</style><div class="p" role="dialog" aria-label="Patchwell accessibility check"><button class="x" aria-label="Close">×</button><h2>Patchwell quick check</h2><div id="b">Scanning this page…</div></div>';
  root.querySelector('.x').onclick = function () { host.remove(); window.__patchwell = null; };
  document.body.appendChild(host);
  window.__patchwell = host;
  var body = root.getElementById('b');

  function run() {
    window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] })
      .then(function (r) {
        var v = r.violations.filter(function (x) { return !x.nodes.some(function (n) { return host.contains(n.element); }); });
        var cnt = { critical: 0, serious: 0, moderate: 0, minor: 0 }, inst = 0;
        v.forEach(function (x) { cnt[x.impact] = (cnt[x.impact] || 0) + 1; inst += x.nodes.length; });
        var ord = { critical: 0, serious: 1, moderate: 2, minor: 3 };
        v.sort(function (a, b) { return ord[a.impact] - ord[b.impact] || b.nodes.length - a.nodes.length; });
        var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
        body.innerHTML = '<div class="n"><div><b class="c">' + cnt.critical + '</b>critical</div><div><b class="s">' + cnt.serious + '</b>serious</div><div><b>' + inst + '</b>instances</div></div>' +
          (v.length ? '<ol>' + v.slice(0, 8).map(function (x) { return '<li><span class="' + x.impact[0] + '">' + x.impact + '</span>: ' + esc(x.help) + ' (' + x.nodes.length + ')</li>'; }).join('') + '</ol>' : '<p>No automated issues on this page. Automated checks catch only part of the problems, though, and keyboard, focus and zoom still need a human look.</p>') +
          '<p style="color:#5b6478;font-size:12px">Automated scan of this one page only. Not legal advice.</p>' +
          '<a class="cta" href="' + SITE + '/#pricing" target="_blank" rel="noopener">Get a full report with code fixes</a>';
      })
      .catch(function (e) { body.textContent = 'Scan failed: ' + e.message; });
  }
  if (window.axe) run();
  else {
    var s = document.createElement('script'); s.src = AXE; s.onload = run;
    s.onerror = function () { body.innerHTML = 'This site blocks outside scripts, so the quick check can\'t run here. <a href="' + SITE + '/#pricing" target="_blank" rel="noopener">Order a full audit</a> instead.'; };
    document.head.appendChild(s);
  }
})();
