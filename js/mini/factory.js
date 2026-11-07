// Xưởng cơm nắm: loại bỏ cơm nắm lỗi trên băng chuyền.
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { rect, text, pick } from '../pixel.js';
import { miniScene, pops } from './common.js';

const DEFECTS = ['nonori', 'broken', 'hair', 'stain'];

// Vẽ phóng to 2 lần cho dễ nhìn, dễ chạm
function drawOnigiri(c, x, y, type) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(2, 2);
  drawOnigiri1(c, 0, 0, type);
  c.restore();
}
function drawOnigiri1(c, x, y, type) {
  for (let r = 0; r < 11; r++) {
    let w = 3 + r;
    const left = x - Math.floor(w / 2);
    if (type === 'broken' && r >= 3 && r <= 7) w -= 4;
    rect(c, r === 0 ? '#e8e2d4' : '#fbf8f0', left, y - 6 + r, w, 1);
    rect(c, '#d9d1c0', left, y - 6 + r, 1, 1);
  }
  if (type === 'broken') { rect(c, '#fbf8f0', x + 6, y + 3, 1, 1); rect(c, '#fbf8f0', x + 8, y + 4, 1, 1); }
  if (type !== 'nonori') { rect(c, '#1f3a2a', x - 4, y + 1, 9, 4); rect(c, '#2f5643', x - 4, y + 1, 9, 1); }
  if (type === 'hair') {
    for (let i = 0; i < 6; i++) rect(c, '#1a1a1a', x - 3 + i, y - 2 + (i % 2), 1, 1);
  }
  if (type === 'stain') { rect(c, '#a8672e', x + 1, y - 2, 3, 2); rect(c, '#a8672e', x - 2, y - 1, 1, 1); }
}

export function factoryScene(diff, done) {
  const items = [], flies = [], P = pops();
  let spawn = 0.5, total = 0, correct = 0, caught = 0, missed = 0, wrong = 0, beltOff = 0;
  const L = (v) => { const beltY = Math.round(v.h * 0.6); const zw = 46; const zx0 = Math.round(v.w * 0.62 - zw / 2); return { beltY, zx0, zx1: zx0 + zw }; };

  function reject(it, v) {
    items.splice(items.indexOf(it), 1);
    total++;
    flies.push({ x: it.x, y: L(v).beltY - 11, vx: -20 + Math.random() * 40, vy: -90, type: it.type });
    if (it.bad) { correct++; caught++; P.add(it.x, L(v).beltY - 32, '+1 Chuẩn!', '#9fe3b5'); sfx('good'); }
    else { wrong++; P.add(it.x, L(v).beltY - 32, 'Nhầm hàng tốt!', '#ff8a8a'); sfx('bad'); }
  }

  const core = {
    update(dt, v, t, dur) {
      const { beltY, zx0, zx1 } = L(v);
      const speed = (v.w / 9) * (1 + diff * 0.4 + (t / dur) * 0.3);
      beltOff = (beltOff + speed * dt) % 10;
      spawn -= dt;
      const last = items[items.length - 1];
      if (spawn <= 0 && (!last || last.x > 38)) {
        const bad = Math.random() < 0.36;
        items.push({ x: -14, bad, type: bad ? pick(DEFECTS) : 'ok' });
        spawn = (1 + Math.random() * 0.8) / (1 + diff * 0.35 + (t / dur) * 0.2);
      }
      for (const it of items) it.x += speed * dt;
      while (items.length && items[0].x > v.w + 10) {
        const it = items.shift();
        total++;
        if (it.bad) { missed++; P.add(v.w - 30, beltY - 24, 'Lọt hàng lỗi!', '#ff8a8a'); sfx('bad'); } else correct++;
      }
      for (const f of flies) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt; }
      while (flies.length && flies[0].y > v.h + 20) flies.shift();
      P.update(dt);
      if (input.act()) {
        const it = items.find((i) => i.x >= zx0 && i.x <= zx1);
        if (it) reject(it, v); else sfx('tap');
      }
    },
    tap(x, y, v) {
      const { beltY } = L(v);
      let best = null, bd = 20;
      for (const it of items) { const d = Math.hypot(it.x - x, beltY - 11 - y); if (d < bd) { bd = d; best = it; } }
      if (best) reject(best, v);
    },
    draw(c, v, t) {
      const { w, h } = v;
      const { beltY, zx0, zx1 } = L(v);
      rect(c, '#dfe4e8', 0, 0, w, h);
      rect(c, '#c9d0d6', 0, Math.round(h * 0.35), w, 2);
      for (let x = 8; x < w; x += 40) { rect(c, '#bcc5cc', x, 20, 24, Math.round(h * 0.3) - 10); rect(c, '#e9f3f8', x + 2, 22, 20, Math.round(h * 0.3) - 14); }
      rect(c, '#9aa3ab', 0, beltY + 20, w, h - beltY - 20);
      text(c, '衛生第一 · Vệ sinh là trên hết', w / 2, Math.round(h * 0.35) - 8, { size: 6, align: 'center', color: '#5b6772', shadow: false });
      // vùng kiểm tra
      c.fillStyle = 'rgba(255,207,90,.28)'; c.fillRect(zx0, beltY - 32, zx1 - zx0, 32);
      rect(c, '#ffcf5a', zx0, beltY - 32, 1, 32); rect(c, '#ffcf5a', zx1 - 1, beltY - 32, 1, 32);
      text(c, 'KIỂM TRA', (zx0 + zx1) / 2, beltY - 38, { size: 6, align: 'center', color: '#8a6a10', shadow: false });
      // băng chuyền
      rect(c, '#3b3f46', 0, beltY, w, 12);
      for (let x = -10 + beltOff; x < w; x += 10) rect(c, '#4c525b', Math.round(x), beltY + 1, 2, 10);
      rect(c, '#2a2d33', 0, beltY + 12, w, 3);
      for (let x = 20; x < w; x += 60) rect(c, '#5a6068', x, beltY + 15, 3, 8);
      for (const it of items) drawOnigiri(c, it.x, beltY - 11, it.type);
      for (const f of flies) drawOnigiri(c, f.x, f.y, f.type);
      // thùng
      rect(c, '#c0392b', 4, beltY + 26, 40, 18); text(c, 'Hàng lỗi', 24, beltY + 35, { size: 6, align: 'center' });
      rect(c, '#2e8b57', w - 44, beltY + 26, 40, 18); text(c, 'Đạt', w - 24, beltY + 35, { size: 6, align: 'center' });
      text(c, `✔ ${caught}   ✖ ${missed + wrong}`, 5, 24, { size: 7, color: '#2b3340', shadow: false });
      P.draw(c);
    },
    result() {
      const score = total ? correct / total : 0;
      return { score, lines: [`Bắt được hàng lỗi: ${caught}`, `Để lọt hàng lỗi: ${missed}`, `Loại nhầm hàng tốt: ${wrong}`, `Độ chính xác: ${Math.round(score * 100)}%`] };
    },
  };
  return miniScene(core, {
    title: '🍙 Dây chuyền cơm nắm',
    duration: 40,
    help: [
      'Chạm vào cơm nắm bị lỗi để loại ra (hoặc nhấn Space khi nó ở trong ô KIỂM TRA).',
      'Hàng lỗi: thiếu rong biển, bị vỡ góc, dính sợi tóc, có vết bẩn.',
      'Đừng loại nhầm hàng tốt! Băng chuyền sẽ chạy nhanh dần.',
    ],
  }, done);
}
