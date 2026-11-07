// Vẽ pixel-art bằng code: nhân vật, xe, cây, chữ.
export const TS = 16;
export const FONT = '"Nunito", "Segoe UI", system-ui, sans-serif';

export function hash2(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export function rect(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
export function disc(c, col, cx, cy, r) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    c.fillRect(cx - w, cy + dy, w * 2, 1);
  }
}
// amt < 0: tối hơn, amt > 0: sáng hơn
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const to = amt < 0 ? 0 : 255, t = Math.abs(amt);
  r = Math.round(r + (to - r) * t); g = Math.round(g + (to - g) * t); b = Math.round(b + (to - b) * t);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function text(c, s, x, y, o = {}) {
  const size = o.size || 7;
  c.font = `${o.bold === false ? 600 : 800} ${size}px ${FONT}`;
  c.textAlign = o.align || 'left';
  c.textBaseline = o.base || 'middle';
  if (o.shadow !== false) { c.fillStyle = o.shadowColor || 'rgba(0,0,0,.55)'; c.fillText(s, x + size * 0.09, y + size * 0.11); }
  c.fillStyle = o.color || '#fff';
  c.fillText(s, x, y);
}
export function pill(c, s, x, y, o = {}) {
  const size = o.size || 6;
  c.font = `800 ${size}px ${FONT}`;
  const w = Math.ceil(c.measureText(s).width) + size * 1.2, h = size + 4;
  c.fillStyle = o.bg || 'rgba(16,20,36,.82)';
  roundRect(c, x - w / 2, y - h / 2, w, h, h / 2);
  c.fill();
  if (o.border) { c.strokeStyle = o.border; c.lineWidth = 0.6; c.stroke(); }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = o.color || '#fff';
  c.fillText(s, x, y + 0.4);
}
export function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
export function wrap(c, s, maxW, size = 7) {
  c.font = `700 ${size}px ${FONT}`;
  const words = s.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Nhân vật 12x18, (fx, fy) = điểm giữa bàn chân.
// pose: undefined (đứng/đi) | 'sit' | 'sleep' | 'work' (tay thoăn thoắt) | 'bow' (cúi chào) | 'wave'
export function drawPerson(c, fx, fy, look, dir, t, moving, pose) {
  const { skin, hair, shirt, pants } = look;
  if (pose === 'sleep') {
    const x = Math.round(fx) - 8, y = Math.round(fy) - 9;
    rect(c, skin, x, y + 1, 6, 6); rect(c, hair, x, y, 6, 3); rect(c, '#222', x + 3, y + 4, 2, 1);
    rect(c, shade(shirt, 0.15), x + 5, y + 2, 12, 6); rect(c, shade(shirt, -0.1), x + 5, y + 6, 12, 2);
    return;
  }
  const x = Math.round(fx) - 6, feet = Math.round(fy);
  const breathe = !moving && !pose ? (Math.floor(t * 1.4 + fx * 0.07) % 2) : 0;
  const ph = moving ? Math.floor(t * 8) % 4 : 0;
  const sit = pose === 'sit';
  const y = feet - 18 - (ph % 2) + (sit ? 3 : 0) + (pose === 'bow' ? 2 : 0) + breathe * 0;
  const long = look.gender === 'f';
  const side = dir === 'left' || dir === 'right';
  rect(c, 'rgba(0,0,0,.28)', x + 2, feet - 1, 8, 2);
  // chân
  if (sit) {
    rect(c, pants, x + 3, y + 13, 6, 2); rect(c, '#2a2a2a', x + 3, y + 15, 2, 1); rect(c, '#2a2a2a', x + 7, y + 15, 2, 1);
  } else if (!side) {
    const la = ph === 1 ? 1 : 0, lb = ph === 3 ? 1 : 0;
    rect(c, pants, x + 3, y + 13, 2, 4 - la); rect(c, pants, x + 7, y + 13, 2, 4 - lb);
    rect(c, '#2a2a2a', x + 3, y + 17 - la, 2, 1); rect(c, '#2a2a2a', x + 7, y + 17 - lb, 2, 1);
  } else {
    const s = ph === 1 ? 2 : ph === 3 ? -2 : 0;
    const f = dir === 'left' ? -1 : 0;
    rect(c, shade(pants, -0.2), x + 5 - s, y + 13, 2, 4); rect(c, pants, x + 5 + s, y + 13, 2, 4);
    rect(c, '#2a2a2a', x + 5 - s + f, y + 17, 3, 1); rect(c, '#2a2a2a', x + 5 + s + f, y + 17, 3, 1);
  }
  // thân
  rect(c, shirt, x + 2, y + 8 + breathe * 0, 8, 6);
  rect(c, shade(shirt, -0.22), x + 2, y + 13, 8, 1);
  if (breathe) rect(c, shade(shirt, 0.08), x + 3, y + 8, 6, 1);
  const wp = Math.floor(t * 9) % 2;
  const sw = pose === 'work' ? (wp ? 2 : -1) : moving ? (ph === 1 ? 1 : ph === 3 ? -1 : 0) : 0;
  if (pose === 'wave') {
    rect(c, shade(shirt, -0.1), x + 1, y + 9, 1, 3); rect(c, skin, x + 1, y + 12, 1, 1);
    rect(c, shade(shirt, -0.1), x + 10, y + 5 - (Math.floor(t * 6) % 2), 1, 4); rect(c, skin, x + 10, y + 3 - (Math.floor(t * 6) % 2), 2, 2);
  } else if (pose === 'work' && !side) {
    rect(c, shade(shirt, -0.1), x + 1, y + 9 - sw, 1, 3); rect(c, skin, x + 1, y + 8 - sw, 2, 1);
    rect(c, shade(shirt, -0.1), x + 10, y + 9 + sw, 1, 3); rect(c, skin, x + 9, y + 8 + sw, 2, 1);
  } else if (!side) {
    rect(c, shade(shirt, -0.1), x + 1, y + 9 + sw, 1, 3); rect(c, skin, x + 1, y + 12 + sw, 1, 1);
    rect(c, shade(shirt, -0.1), x + 10, y + 9 - sw, 1, 3); rect(c, skin, x + 10, y + 12 - sw, 1, 1);
  } else {
    rect(c, shade(shirt, -0.15), x + 5 + sw, y + 9, 2, 3); rect(c, skin, x + 5 + sw, y + 12, 2, 1);
  }
  // đầu
  rect(c, skin, x + 2, y, 8, 8);
  if (dir === 'up') {
    rect(c, hair, x + 1, y, 10, 7);
    if (long) rect(c, hair, x + 2, y + 7, 8, 3);
  } else {
    rect(c, hair, x + 2, y, 8, 1); rect(c, hair, x + 1, y + 1, 10, 2);
    if (dir === 'down') {
      rect(c, hair, x + 1, y + 3, 1, long ? 7 : 2); rect(c, hair, x + 10, y + 3, 1, long ? 7 : 2);
      rect(c, '#222', x + 4, y + 4, 1, 2); rect(c, '#222', x + 7, y + 4, 1, 2);
      rect(c, shade(skin, -0.18), x + 5, y + 6, 2, 1);
    } else if (dir === 'left') {
      rect(c, hair, x + 7, y + 2, 4, long ? 8 : 4);
      rect(c, '#222', x + 3, y + 4, 1, 2);
    } else {
      rect(c, hair, x + 1, y + 2, 4, long ? 8 : 4);
      rect(c, '#222', x + 8, y + 4, 1, 2);
    }
  }
}

export function drawCat(c, fx, fy, t) {
  const x = Math.round(fx) - 5, y = Math.round(fy) - 7;
  const tail = Math.floor(t * 3) % 2;
  rect(c, 'rgba(0,0,0,.25)', x + 1, y + 7, 9, 1);
  rect(c, '#e2954a', x + 2, y + 3, 7, 4);       // thân
  rect(c, '#e2954a', x, y, 4, 4);               // đầu
  rect(c, '#e2954a', x, y - 1, 1, 1); rect(c, '#e2954a', x + 3, y - 1, 1, 1); // tai
  rect(c, '#b86a2a', x + 4, y + 3, 1, 4); rect(c, '#b86a2a', x + 7, y + 3, 1, 4); // vằn
  rect(c, '#222', x + 1, y + 1, 1, 1);
  rect(c, '#e2954a', x + 9, y + 1 + tail, 1, 3);
}

export function drawCar(c, x, y, horiz, col) {
  x = Math.round(x); y = Math.round(y);
  if (horiz) {
    rect(c, 'rgba(0,0,0,.25)', x - 11, y + 4, 22, 2);
    rect(c, '#1c1c1c', x - 9, y + 3, 4, 2); rect(c, '#1c1c1c', x + 5, y + 3, 4, 2);
    rect(c, col, x - 11, y - 5, 22, 9);
    rect(c, shade(col, 0.25), x - 11, y - 5, 22, 1);
    rect(c, shade(col, -0.25), x - 11, y + 3, 22, 1);
    rect(c, '#9cc7e0', x - 6, y - 4, 12, 4);
    rect(c, shade(col, -0.1), x - 1, y - 4, 1, 4);
  } else {
    rect(c, 'rgba(0,0,0,.25)', x - 4, y + 10, 10, 2);
    rect(c, '#1c1c1c', x - 6, y - 7, 2, 4); rect(c, '#1c1c1c', x + 4, y - 7, 2, 4);
    rect(c, '#1c1c1c', x - 6, y + 4, 2, 4); rect(c, '#1c1c1c', x + 4, y + 4, 2, 4);
    rect(c, col, x - 5, y - 10, 10, 20);
    rect(c, shade(col, 0.25), x - 5, y - 10, 10, 1);
    rect(c, '#9cc7e0', x - 4, y - 5, 8, 4);
    rect(c, '#9cc7e0', x - 4, y + 4, 8, 3);
  }
}
