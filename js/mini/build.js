// Công trường: chồng các thanh thép thẳng hàng để dựng 10 tầng giàn giáo.
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { rect, text } from '../pixel.js';
import { miniScene, pops } from './common.js';

const TARGET = 10, FH = 9;

export function buildScene(diff, done) {
  let blocks = null, mov = null, camY = 0;
  const falling = [], P = pops();
  let floors = 0, prec = 0, misses = 0, perfects = 0, vw = 320;
  const groundY = (v) => v.h - 18;
  const blockY = (i, v) => groundY(v) - (i + 1) * FH + camY;

  function init(v) {
    const W0 = Math.round(Math.min(84, v.w * 0.42));
    blocks = [{ x: Math.round(v.w / 2 - W0 / 2), w: W0 }];
    newBeam(v);
  }
  function newBeam(v) {
    const top = blocks[blocks.length - 1];
    const fromLeft = Math.random() < 0.5;
    mov = { x: fromLeft ? 0 : v.w - top.w, w: top.w, d: fromLeft ? 1 : -1 };
  }
  function drop(v) {
    const top = blocks[blocks.length - 1];
    const l = Math.max(mov.x, top.x), r = Math.min(mov.x + mov.w, top.x + top.w), ov = r - l;
    const y = blockY(blocks.length, v);
    if (ov <= 1) {
      misses++;
      falling.push({ x: mov.x, w: mov.w, y, vy: 0 });
      P.add(mov.x + mov.w / 2, y - 6, 'Trượt!', '#ff8a8a'); sfx('bad');
      newBeam(v);
      return;
    }
    if (Math.abs(mov.x - top.x) <= 2) {
      perfects++; prec += 1;
      blocks.push({ x: top.x, w: top.w });
      P.add(top.x + top.w / 2, y - 6, 'Hoàn hảo!', '#ffe066'); sfx('coin');
    } else {
      prec += ov / top.w;
      blocks.push({ x: l, w: ov });
      if (mov.x < top.x) falling.push({ x: mov.x, w: top.x - mov.x, y, vy: 0 });
      else falling.push({ x: top.x + top.w, w: mov.x + mov.w - (top.x + top.w), y, vy: 0 });
      P.add(l + ov / 2, y - 6, ov / top.w > 0.85 ? 'Tốt!' : 'Lệch…', '#fff'); sfx('tap');
    }
    floors++;
    if (floors < TARGET) newBeam(v);
  }

  const core = {
    update(dt, v, t) {
      vw = v.w;
      if (!blocks) init(v);
      if (floors < TARGET) {
        const wind = floors >= 5 ? 1 + 0.4 * Math.sin(t * 2.3) : 1;
        const sp = v.w * 0.42 * (1 + diff * 0.45 + floors * 0.05) * wind;
        mov.x += mov.d * sp * dt;
        if (mov.x < 0) { mov.x = 0; mov.d = 1; }
        if (mov.x > v.w - mov.w) { mov.x = v.w - mov.w; mov.d = -1; }
        if (input.act()) drop(v);
      }
      const want = Math.max(0, (blocks.length + 2) * FH - v.h * 0.5);
      camY += (want - camY) * Math.min(1, dt * 4);
      for (const f of falling) { f.vy += 260 * dt; f.y += f.vy * dt; }
      while (falling.length && falling[0].y > v.h + 30) falling.shift();
      P.update(dt);
    },
    tap(x, y, v) { if (blocks && floors < TARGET) drop(v); },
    finished() { return floors >= TARGET; },
    draw(c, v, t) {
      const { w, h } = v;
      if (!blocks) init(v);
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#8fc3e6'); g.addColorStop(1, '#e3f0f7');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) { const bx = (i * 53) % w, bh = 20 + ((i * 37) % 40); rect(c, '#b8cfdd', bx, groundY(v) - bh + camY * 0.3, 30, bh); }
      rect(c, '#8a6a4a', 0, groundY(v) + camY, w, 40);
      rect(c, '#6e5238', 0, groundY(v) + camY, w, 2);
      // nền móng + các tầng
      blocks.forEach((b, i) => {
        const y = Math.round(blockY(i, v));
        if (i === 0) { rect(c, '#9a9a9a', Math.round(b.x), y, Math.round(b.w), FH); rect(c, '#b5b5b5', Math.round(b.x), y, Math.round(b.w), 1); return; }
        beam(c, b.x, y, b.w);
        rect(c, '#7d8590', Math.round(b.x) + 1, y + FH - 1, 1, 1);
      });
      for (const f of falling) beam(c, f.x, Math.round(f.y), f.w, 0.7);
      if (floors < TARGET) {
        const y = Math.round(blockY(blocks.length, v) - 10);
        rect(c, '#333', Math.round(mov.x + mov.w / 2), 16, 1, y - 16);
        rect(c, '#555', Math.round(mov.x + mov.w / 2) - 2, y - 3, 5, 3);
        beam(c, mov.x, y, mov.w);
      }
      text(c, `Tầng ${floors}/${TARGET}`, w - 5, 24, { size: 7, align: 'right', color: '#1b2a3a', shadow: false });
      if (floors >= 5 && floors < TARGET) text(c, '💨 Gió mạnh!', 5, 24, { size: 7, color: '#1b2a3a', shadow: false });
      P.draw(c);
    },
    result() {
      const score = Math.max(0, Math.min(1, prec / TARGET - misses * 0.04));
      return { score, lines: [`Số tầng dựng được: ${floors}/${TARGET}`, `Đặt hoàn hảo: ${perfects}`, `Trượt rơi: ${misses}`] };
    },
  };

  function beam(c, x, y, w, alpha = 1) {
    x = Math.round(x); w = Math.round(w);
    if (w <= 0) return;
    c.globalAlpha = alpha;
    rect(c, '#e9a23b', x, y, w, FH - 1);
    rect(c, '#f6c36a', x, y, w, 2);
    rect(c, '#b5761f', x, y + FH - 3, w, 2);
    for (let i = x + 3; i < x + w - 2; i += 8) rect(c, '#7a4e12', i, y + 3, 1, 1);
    c.globalAlpha = 1;
  }

  return miniScene(core, {
    title: '🏗️ Dựng giàn giáo',
    duration: 45,
    help: [
      'Thanh thép chạy qua lại. Chạm (hoặc Space) để thả xuống.',
      'Phần thò ra ngoài tầng dưới sẽ bị cắt bỏ — thanh mới ngắn dần. Thả trùng khít = Hoàn hảo!',
      'Dựng đủ 10 tầng trước khi hết giờ. Từ tầng 5 có gió mạnh.',
    ],
  }, done);
}
