// Nhà kính dâu tây: hái quả chín, tránh quả xanh.
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { rect, disc, text } from '../pixel.js';
import { miniScene, pops } from './common.js';

export function farmScene(diff, done) {
  const N = 15;
  const cells = Array.from({ length: N }, () => ({ s: 'none', t: 0, gold: false }));
  const P = pops();
  let spawn = 0.3, picks = 0, berries = 0, missed = 0, damaged = 0, cursor = 7, showCursor = false;
  const lay = (v) => {
    const land = v.w > v.h;
    const cols = land ? 5 : 3, rows = land ? 3 : 5;
    const top = 30;
    const cs = Math.floor(Math.min((v.w - 12) / cols, (v.h - top - 8) / rows));
    return { cols, rows, cs, ox: Math.round((v.w - cs * cols) / 2), oy: top + Math.round((v.h - top - 8 - cs * rows) / 2) };
  };
  const center = (i, L) => ({ x: L.ox + (i % L.cols) * L.cs + L.cs / 2, y: L.oy + Math.floor(i / L.cols) * L.cs + L.cs / 2 });

  function hit(i, L) {
    const cl = cells[i], p = center(i, L);
    if (cl.s === 'red') {
      picks++; berries += cl.gold ? 2 : 1;
      P.add(p.x, p.y - 10, cl.gold ? '+2 ✨' : '+1', cl.gold ? '#ffe066' : '#9fe3b5');
      sfx(cl.gold ? 'coin' : 'good');
      cl.s = 'none';
    } else if (cl.s === 'green' || cl.s === 'white') {
      damaged++; P.add(p.x, p.y - 10, 'Dập quả xanh!', '#ff8a8a'); sfx('bad'); cl.s = 'none';
    } else if (cl.s === 'rot') { cl.s = 'none'; sfx('tap'); }
  }

  let lastL = null;
  const core = {
    update(dt, v, t, dur) {
      const L = lay(v); lastL = L;
      const ripe = 1.9 - diff * 0.6;
      for (const cl of cells) {
        if (cl.s === 'none') continue;
        cl.t -= dt;
        if (cl.t > 0) continue;
        if (cl.s === 'green') { cl.s = 'white'; cl.t = 0.7 + Math.random() * 0.6; }
        else if (cl.s === 'white') { cl.s = 'red'; cl.t = ripe * (cl.gold ? 0.75 : 1); }
        else if (cl.s === 'red') { cl.s = 'rot'; cl.t = 1; missed++; }
        else cl.s = 'none';
      }
      spawn -= dt;
      const active = cells.filter((c) => c.s !== 'none').length;
      if (spawn <= 0 && active < 5 + diff * 3 + (t / dur) * 2) {
        const free = cells.map((c, i) => (c.s === 'none' ? i : -1)).filter((i) => i >= 0);
        if (free.length) {
          const cl = cells[free[Math.floor(Math.random() * free.length)]];
          cl.s = 'green'; cl.t = 1.1 + Math.random() * 0.9; cl.gold = Math.random() < 0.07;
        }
        spawn = (0.35 + Math.random() * 0.4) / (1 + diff * 0.6);
      }
      if (input.hit('ArrowLeft') || input.hit('KeyA')) { cursor = (cursor + N - 1) % N; showCursor = true; }
      if (input.hit('ArrowRight') || input.hit('KeyD')) { cursor = (cursor + 1) % N; showCursor = true; }
      if (input.hit('ArrowUp') || input.hit('KeyW')) { cursor = (cursor - L.cols + N) % N; showCursor = true; }
      if (input.hit('ArrowDown') || input.hit('KeyS')) { cursor = (cursor + L.cols) % N; showCursor = true; }
      if (input.act()) { showCursor = true; hit(cursor, L); }
      P.update(dt);
    },
    tap(x, y, v) {
      const L = lay(v);
      const col = Math.floor((x - L.ox) / L.cs), row = Math.floor((y - L.oy) / L.cs);
      if (col < 0 || row < 0 || col >= L.cols || row >= L.rows) return;
      showCursor = false;
      hit(row * L.cols + col, L);
    },
    draw(c, v, t) {
      const { w, h } = v;
      const L = lastL || lay(v);
      rect(c, '#cfe8d4', 0, 0, w, h);
      for (let x = 0; x < w; x += 24) rect(c, 'rgba(255,255,255,.35)', x, 0, 1, h);
      rect(c, '#b7d7bd', 0, 16, w, 8);
      text(c, `🧺 ${berries} quả`, 5, 24, { size: 7, color: '#2b4a31', shadow: false });
      for (let i = 0; i < N; i++) {
        const p = center(i, L), cl = cells[i];
        const r = Math.max(5, Math.floor(L.cs * 0.16));
        rect(c, '#7a5236', Math.round(p.x - L.cs / 2 + 2), Math.round(p.y + L.cs * 0.18), L.cs - 4, Math.round(L.cs * 0.25));
        disc(c, '#3f8f45', Math.round(p.x - r), Math.round(p.y - r * 0.4), r);
        disc(c, '#4fa652', Math.round(p.x + r), Math.round(p.y - r * 0.4), r);
        disc(c, '#5bb85c', Math.round(p.x), Math.round(p.y - r * 1.2), r);
        if (cl.s !== 'none') {
          const col = cl.s === 'green' ? '#7cc35a' : cl.s === 'white' ? '#f2efdc' : cl.s === 'rot' ? '#5b3a2e' : cl.gold ? '#f5c542' : '#e23b3b';
          const br = Math.max(4, Math.floor(L.cs * 0.14));
          const bx = Math.round(p.x), by = Math.round(p.y + br * 0.6);
          disc(c, col, bx, by, br);
          rect(c, col, bx - Math.floor(br / 2), by + br, br, 1);
          rect(c, '#2f7d32', bx - 2, by - br - 1, 5, 2);
          if (cl.s === 'red') for (let k = 0; k < 4; k++) rect(c, cl.gold ? '#fff6c8' : '#ffd36b', bx - br + 2 + ((k * 3) % (br * 2 - 2)), by - 1 + (k % 2) * 3, 1, 1);
          if (cl.s === 'red' && cl.gold && Math.floor(t * 6) % 2) rect(c, '#fff', bx + br, by - br, 2, 2);
        }
        if (showCursor && i === cursor) {
          c.strokeStyle = '#ffffff'; c.lineWidth = 1;
          c.strokeRect(Math.round(p.x - L.cs / 2) + 1.5, Math.round(p.y - L.cs / 2) + 1.5, L.cs - 3, L.cs - 3);
        }
      }
      P.draw(c);
    },
    result() {
      const den = picks + missed + damaged * 0.8;
      const score = den ? Math.min(1, picks / den) : 0;
      return { score, lines: [`Hái được: ${berries} quả`, `Để chín quá, hỏng: ${missed}`, `Làm dập quả xanh: ${damaged}`] };
    },
  };
  return miniScene(core, {
    title: '🍓 Nhà kính dâu tây',
    duration: 40,
    help: [
      'Chạm vào quả dâu ĐỎ để hái. Quả xanh, quả trắng chưa chín — chạm vào là dập!',
      'Quả để lâu sẽ thâm hỏng. Quả vàng hiếm được tính gấp đôi.',
      'Bàn phím: phím mũi tên để chọn ô, Space để hái.',
    ],
  }, done);
}
