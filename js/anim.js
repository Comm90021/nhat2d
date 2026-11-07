// Biểu cảm trên đầu nhân vật + hiệu ứng nhỏ.
import { FONT, roundRect, rect } from './pixel.js';

// Bong bóng biểu cảm: emoji trong khung trắng, nhấp nhô nhẹ
export function drawEmote(c, x, y, icon, t, alpha = 1) {
  const bob = Math.round(Math.sin(t * 4) * 1);
  const X = Math.round(x), Y = Math.round(y) + bob;
  c.globalAlpha = alpha;
  c.fillStyle = 'rgba(255,255,255,.92)';
  roundRect(c, X - 6, Y - 12, 12, 10, 3); c.fill();
  c.beginPath(); c.moveTo(X - 2, Y - 2); c.lineTo(X, Y + 1); c.lineTo(X + 2, Y - 2); c.closePath(); c.fill();
  c.font = `7px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(icon, X, Y - 6.5);
  c.globalAlpha = 1;
}

// Chọn biểu cảm theo tâm trạng + hoạt động (đổi theo thời gian, không hiện liên tục)
export function emoteFor(moodId, act, t, seed) {
  const cycle = (t + seed * 7.3) % 9;
  if (act === 'sleep') return cycle < 6 ? '💤' : null;
  if (cycle > 2.2) return null;
  if (act === 'work') return moodId === 'cranky' ? '💢' : moodId === 'sad' ? '💦' : cycle < 1.1 ? '💦' : null;
  if (act === 'eat') return '🍜';
  if (act === 'sport') return '⚽';
  if (act === 'study') return '📖';
  if (act === 'worship') return '🙏';
  return { great: '🎵', good: '🙂', ok: null, cranky: '💢', sad: '😢' }[moodId] || null;
}

// Mây đen nhỏ trên đầu khi cáu
export function drawCloud(c, x, y, t) {
  const X = Math.round(x + Math.sin(t * 2) * 1), Y = Math.round(y);
  rect(c, '#4a4f5c', X - 4, Y - 2, 8, 3); rect(c, '#4a4f5c', X - 2, Y - 4, 5, 2);
  if (Math.floor(t * 3) % 2) rect(c, '#8ab4ff', X - 1, Y + 2, 1, 2);
}
