// Khung chung cho mini-game: màn giới thiệu → chơi có giờ → tổng kết.
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { rect, text, wrap, roundRect } from '../pixel.js';

/**
 * core: { update(dt, view, t, dur), draw(c, view, t), tap(x, y, view), result(), finished?() }
 * opts: { title, help: [..], duration }
 */
export function miniScene(core, opts, done) {
  let phase = 'intro', t = 0, endT = 0, result = null, introT = 0;
  const dur = opts.duration;
  const start = () => { phase = 'play'; t = 0; sfx('start'); };
  const finish = () => { phase = 'end'; endT = 0; result = core.result(); sfx('end'); };
  const close = () => { if (phase !== 'end' || endT < 0.8) return; phase = 'gone'; done(result); };

  return {
    isMini: true,
    update(dt, view) {
      if (phase === 'intro') { introT += dt; if (introT > 0.3 && input.act()) start(); return; }
      if (phase === 'play') {
        t += dt;
        core.update(dt, view, t, dur);
        if (t >= dur || (core.finished && core.finished())) finish();
      } else if (phase === 'end') {
        endT += dt;
        if (input.act()) close();
      }
    },
    draw(c, view) {
      const { w, h } = view;
      core.draw(c, view, phase === 'play' ? t : 0);
      // thanh trên cùng
      rect(c, 'rgba(14,18,34,.82)', 0, 0, w, 16);
      text(c, opts.title, 5, 8, { size: 7, color: '#ffcf5a' });
      if (phase === 'play') {
        const left = Math.max(0, dur - t);
        const bw = Math.min(90, w * 0.32), bx = w - bw - 26;
        rect(c, '#2a3350', bx, 5, bw, 6);
        rect(c, left < 8 ? '#ff6b6b' : '#6bd18b', bx, 5, Math.round(bw * left / dur), 6);
        text(c, Math.ceil(left) + 's', w - 4, 8, { size: 7, align: 'right' });
      }
      if (phase === 'intro' || phase === 'end') {
        rect(c, 'rgba(8,10,24,.55)', 0, 16, w, h - 16);
        const bw = Math.min(w - 16, 300);
        const lines = phase === 'intro'
          ? opts.help.flatMap((s) => wrap(c, s, bw - 16, 7))
          : (result.lines || []).flatMap((s) => wrap(c, s, bw - 16, 7));
        const bh = 34 + lines.length * 10 + 16;
        const bx = Math.round((w - bw) / 2), by = Math.round(16 + (h - 16 - bh) / 2);
        c.fillStyle = 'rgba(22,28,52,.96)';
        roundRect(c, bx, by, bw, bh, 6); c.fill();
        c.strokeStyle = '#ffcf5a'; c.lineWidth = 1; c.stroke();
        const head = phase === 'intro' ? opts.title : `Hết ca! Điểm: ${Math.round(result.score * 100)}/100`;
        text(c, head, w / 2, by + 13, { size: 9, align: 'center', color: '#ffcf5a' });
        lines.forEach((s, i) => text(c, s, bx + 8, by + 30 + i * 10, { size: 7, bold: false }));
        const blink = Math.floor((phase === 'intro' ? introT : endT) * 2.5) % 2 === 0;
        const ready = phase === 'intro' || endT > 0.8;
        if (ready && blink) {
          const touch = document.body.classList.contains('touch');
          text(c, touch ? '👆 Chạm để ' + (phase === 'intro' ? 'bắt đầu' : 'tiếp tục') : 'Nhấn Space / chạm để ' + (phase === 'intro' ? 'bắt đầu' : 'tiếp tục'),
            w / 2, by + bh - 9, { size: 7, align: 'center', color: '#9fe3b5' });
        }
      }
    },
    pointer(x, y, view) {
      if (phase === 'intro') { if (introT > 0.3) start(); }
      else if (phase === 'play') core.tap(x, y, view);
      else close();
    },
  };
}

export function pops() {
  const list = [];
  return {
    add(x, y, s, color = '#fff') { list.push({ x, y, s, color, t: 0 }); },
    update(dt) { for (const p of list) { p.t += dt; p.y -= 14 * dt; } while (list.length && list[0].t > 0.9) list.shift(); },
    draw(c) { for (const p of list) { c.globalAlpha = Math.max(0, 1 - p.t / 0.9); text(c, p.s, p.x, p.y, { size: 7, align: 'center', color: p.color }); } c.globalAlpha = 1; },
  };
}
