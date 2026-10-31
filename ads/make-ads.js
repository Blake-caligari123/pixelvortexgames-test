/* Renders Facebook/Instagram ad images (1080x1080 + 1080x1350) from the real kit pages. node ads/make-ads.js */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const R = path.resolve(__dirname, '..');
const P = (f) => `file://${R}/site/assets/previews/${f}`;
const F = `file://${R}/site/assets/fonts/`;
const base = `@font-face{font-family:Fredoka;font-weight:700;src:url(${F}fredoka-latin-700-normal.woff2)}@font-face{font-family:Fredoka;font-weight:600;src:url(${F}fredoka-latin-600-normal.woff2)}@font-face{font-family:Nunito;font-weight:800;src:url(${F}nunito-latin-800-normal.woff2)}
*{box-sizing:border-box}body{margin:0}.ad{position:relative;overflow:hidden;font-family:Nunito;color:#23305A}h1{font-family:Fredoka;font-weight:700;margin:0;line-height:1.02}
.pg{position:absolute;border-radius:12px;box-shadow:0 24px 50px rgba(35,48,90,.28);background:#fff}.pill{display:inline-block;font-family:Fredoka;font-weight:600;border-radius:99px;padding:12px 26px;font-size:30px}`;
const ads = {
  'ad1-meltdown': [1080, 1080, `<div class="ad" style="width:1080px;height:1080px;background:#FFF8EE">
    <div style="position:absolute;right:-120px;top:-120px;width:420px;height:420px;border-radius:50%;background:#FFC53D"></div>
    <div style="position:absolute;left:70px;top:80px;width:620px"><h1 style="font-size:92px">Screen time ends.<br><span style="color:#E8573A">Meltdown begins.</span></h1>
    <p style="font-size:38px;margin-top:26px;font-weight:800">There's a calmer way.<br>A 30-day plan that sticks.</p></div>
    <img class="pg" src="${P('screen-free-family-reset-5.png')}" style="width:330px;left:430px;top:610px;transform:rotate(-7deg)">
    <img class="pg" src="${P('screen-free-family-reset-1.png')}" style="width:360px;left:680px;top:540px;transform:rotate(5deg)">
    <span class="pill" style="position:absolute;left:70px;bottom:60px;background:#23305A;color:#fff">Printable kit · ages 3–12</span></div>`],
  'ad2-100-activities': [1080, 1080, `<div class="ad" style="width:1080px;height:1080px;background:#EAF6F0">
    <div style="position:absolute;left:70px;top:70px;right:70px"><h1 style="font-size:100px">100 things to do<br>that <span style="color:#13867E">aren't a screen.</span></h1></div>
    <img class="pg" src="${P('screen-free-family-reset-14.png')}" style="width:390px;left:110px;top:330px;transform:rotate(-5deg)">
    <img class="pg" src="${P('screen-free-family-reset-26.png')}" style="width:390px;left:570px;top:350px;transform:rotate(4deg)">
    <span class="pill" style="position:absolute;right:70px;bottom:60px;background:#E8573A;color:#fff">Print tonight. Start tomorrow.</span></div>`],
  'ad3-winter-break': [1080, 1080, `<div class="ad" style="width:1080px;height:1080px;background:#EEF6FF">
    <div style="position:absolute;left:-100px;bottom:-140px;width:460px;height:460px;border-radius:50%;background:#DCD4FF"></div>
    <div style="position:absolute;left:70px;top:70px;width:940px"><h1 style="font-size:88px">Winter break =<br>2 weeks of <span style="color:#1F7FB0">"I'm bored."</span></h1>
    <p style="font-size:38px;margin-top:22px;font-weight:800">Have a plan for the screens this year.</p></div>
    <img class="pg" src="${P('winter-break-pack-2.png')}" style="width:420px;left:520px;top:440px;transform:rotate(5deg)">
    <img class="pg" src="${P('screen-free-family-reset-12.png')}" style="width:380px;left:150px;top:500px;transform:rotate(-6deg)"></div>`],
  'ad4-whats-inside': [1080, 1350, `<div class="ad" style="width:1080px;height:1350px;background:#FFF8EE">
    <div style="position:absolute;left:70px;top:70px;right:70px"><h1 style="font-size:84px">The Screen-Free<br>Family Reset</h1><p style="font-size:36px;font-weight:800;margin-top:14px">Less screen time. Fewer fights.</p></div>
    <img class="pg" src="${P('screen-free-family-reset-1.png')}" style="width:470px;left:70px;top:360px;transform:rotate(-3deg)">
    <div style="position:absolute;left:600px;top:380px;width:420px;font-size:34px;font-weight:800;line-height:1.35">${['30-day challenge', '100 activity cards', 'Family agreement', 'Reward charts', 'Meltdown scripts', '"I\'m bored!" poster'].map((t) => `<div style="margin:0 0 22px">&#10003;&nbsp; ${t}</div>`).join('')}</div>
    <span class="pill" style="position:absolute;left:70px;bottom:70px;background:#E8573A;color:#fff;font-size:36px">Instant download · $24</span></div>`],
};
(async () => {
  const b = await chromium.launch();
  for (const [name, [w, h, html]] of Object.entries(ads)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const tmp = path.join(__dirname, '.render.html');
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${base}</style></head><body>${html}</body></html>`);
    await p.goto('file://' + tmp, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(__dirname, name + '.png') });
    await p.close();
  }
  fs.rmSync(path.join(__dirname, '.render.html'), { force: true });
  await b.close(); console.log('ads rendered:', Object.keys(ads).join(', '));
})();
