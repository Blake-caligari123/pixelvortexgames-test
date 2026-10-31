/* Beamline core: deterministic daily puzzle generation + beam tracing. No DOM. */
(function (root) {
  'use strict';
  const N = 7;
  const EPOCH = Date.UTC(2026, 9, 31); // Puzzle #1 = 2026-10-31

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const inside = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  const key = (x, y) => x + ',' + y;
  // '/' turns east->north; '\' turns east->south (y grows downward)
  const reflect = (d, m) => (m === '/' ? [-d[1], -d[0]] : [d[1], d[0]]);

  function generate(seed) {
    const rnd = mulberry32(hashStr(String(seed)));
    const ri = (n) => Math.floor(rnd() * n);
    for (let attempt = 0; attempt < 20000; attempt++) {
      const side = ri(4), k = ri(N);
      let x, y, d;
      if (side === 0) { x = -1; y = k; d = [1, 0]; }
      else if (side === 1) { x = N; y = k; d = [-1, 0]; }
      else if (side === 2) { x = k; y = -1; d = [0, 1]; }
      else { x = k; y = N; d = [0, -1]; }
      const emitter = { x, y, d: d.slice() };
      const visited = new Set(), straight = [], solution = [];
      let ok = true, sinceTurn = 0;
      for (;;) {
        x += d[0]; y += d[1];
        if (!inside(x, y)) break;
        const kk = key(x, y);
        if (visited.has(kk) || visited.size > 30) { ok = false; break; }
        visited.add(kk);
        sinceTurn++;
        if (sinceTurn >= 2 && rnd() < 0.4 && solution.length < 6) {
          const m = rnd() < 0.5 ? '/' : '\\';
          solution.push({ x, y, m }); d = reflect(d, m); sinceTurn = 0;
        } else straight.push({ x, y });
      }
      if (!ok || solution.length < 4 || visited.size < 13 || straight.length < 6) continue;
      const receiver = { x, y };
      if (Math.abs(receiver.x - emitter.x) + Math.abs(receiver.y - emitter.y) < 3) continue;
      // crystals on the solution path (never on a mirror cell)
      for (let i = straight.length - 1; i > 0; i--) { const j = ri(i + 1); [straight[i], straight[j]] = [straight[j], straight[i]]; }
      const crystals = straight.slice(0, solution.length >= 5 ? 4 : 3);
      // walls on cells the solution never touches
      const free = [];
      for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) if (!visited.has(key(xx, yy))) free.push({ x: xx, y: yy });
      for (let i = free.length - 1; i > 0; i--) { const j = ri(i + 1); [free[i], free[j]] = [free[j], free[i]]; }
      const walls = free.slice(0, 5 + ri(3));
      const puzzle = { n: N, emitter, receiver, crystals, walls, par: solution.length, budget: solution.length + 1, solution };
      if (trace(puzzle, {}).solved) continue; // no free wins
      return puzzle;
    }
    throw new Error('generation failed for seed ' + seed);
  }

  // mirrors: Map/obj of "x,y" -> '/' | '\'
  function trace(p, mirrors) {
    const walls = new Set(p.walls.map((c) => key(c.x, c.y)));
    const crystals = new Set(p.crystals.map((c) => key(c.x, c.y)));
    const lit = new Set();
    let x = p.emitter.x, y = p.emitter.y, d = p.emitter.d.slice();
    const points = [[x, y]];
    let outcome = 'loop';
    for (let step = 0; step < 400; step++) {
      x += d[0]; y += d[1];
      if (!inside(x, y)) { points.push([x, y]); outcome = (x === p.receiver.x && y === p.receiver.y) ? 'receiver' : 'escaped'; break; }
      const kk = key(x, y);
      if (walls.has(kk)) { points.push([x - d[0] * 0.5, y - d[1] * 0.5]); outcome = 'blocked'; break; }
      if (crystals.has(kk)) lit.add(kk);
      const m = mirrors[kk];
      if (m) { points.push([x, y]); d = reflect(d, m); }
    }
    return { points, lit, outcome, solved: outcome === 'receiver' && lit.size === crystals.size };
  }

  function dateKey(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function puzzleNumber(dk) {
    const [Y, M, D] = dk.split('-').map(Number);
    return Math.round((Date.UTC(Y, M - 1, D) - EPOCH) / 86400000) + 1;
  }

  const api = { N, generate, trace, dateKey, puzzleNumber, key };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Beamline = api;
})(this);
