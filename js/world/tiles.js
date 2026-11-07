// Loại ô và cách vẽ: ngoài trời (thị trấn, khu công nghiệp) và trong nhà.
import { TS, hash2, rect, disc, shade } from '../pixel.js';

export const T = {
  GRASS: 0, ROAD: 1, WALK: 2, WATER: 3, BRIDGE: 4, TREE: 5, FLOWER: 6, PATH: 7, PLAZA: 8, BLD: 9,
  RAIL: 10, PLATFORM: 11, CONCRETE: 12, PARKING: 13, FENCE: 14,
  FWOOD: 20, FTILE: 21, FCONC: 22, FTATAMI: 23, WALL: 24, DOOR: 25, FCARPET: 26, FSOIL: 27, VOID: 28,
};
export const SOLID = new Set([T.WATER, T.TREE, T.BLD, T.RAIL, T.FENCE, T.WALL, T.VOID]);

export const PAL = [
  { grass: '#8cc46e', g2: '#7ab35f', g3: '#a6d68a', path: '#d6b98e', water: '#4a8fd0', w2: '#78b5e8', fl: ['#f7a8c4', '#ffffff', '#ffd75e'] },
  { grass: '#5fae4e', g2: '#4f9c41', g3: '#76c264', path: '#cfae7f', water: '#3f86cc', w2: '#70b0e6', fl: ['#6aa6ff', '#ffd75e', '#ffffff'] },
  { grass: '#b4a65a', g2: '#a1924a', g3: '#c8b86a', path: '#c9a678', water: '#4a82b8', w2: '#7aa9d6', fl: ['#e0463c', '#f2a03d'] },
  { grass: '#e8eef2', g2: '#d3dce4', g3: '#ffffff', path: '#d9d4cc', water: '#6d9cc2', w2: '#a9c8e0', fl: [] },
];

export function drawTile(c, M, x, y, si) {
  const t = M.at(x, y), X = x * TS, Y = y * TS, p = PAL[si];
  const at = M.at;
  if (t === T.GRASS || t === T.TREE || t === T.FLOWER || t === T.BLD || t === T.FENCE) {
    rect(c, p.grass, X, Y, TS, TS);
    for (let k = 0; k < 4; k++) rect(c, k % 2 ? p.g2 : p.g3, X + Math.floor(hash2(x, y, k) * 15), Y + Math.floor(hash2(x, y, k + 9) * 14), 1, 2);
    if (t === T.FLOWER && p.fl.length) for (let k = 0; k < 3; k++) {
      const hx = 2 + Math.floor(hash2(x, y, k + 20) * 11), hy = 2 + Math.floor(hash2(x, y, k + 30) * 11);
      rect(c, p.fl[k % p.fl.length], X + hx, Y + hy, 2, 2); rect(c, '#3f7d3a', X + hx, Y + hy + 2, 1, 1);
    }
    if (t === T.FENCE) {
      rect(c, '#9aa3ab', X, Y + 5, TS, 2); rect(c, '#9aa3ab', X, Y + 11, TS, 2);
      rect(c, '#6f777e', X + 1, Y + 2, 2, 13); rect(c, '#6f777e', X + 9, Y + 2, 2, 13);
    }
  } else if (t === T.ROAD) {
    rect(c, '#575c66', X, Y, TS, TS);
    for (let k = 0; k < 3; k++) rect(c, '#4d525b', X + Math.floor(hash2(x, y, k) * 15), Y + Math.floor(hash2(x, y, k + 5) * 15), 1, 1);
    // vạch giữa đường: đường ngang 2 làn / đường dọc 2 làn
    if (at(x, y + 1) === T.ROAD && at(x, y - 1) !== T.ROAD && at(x, y + 2) !== T.ROAD) { rect(c, '#e8e2c8', X + 2, Y + 15, 5, 1); rect(c, '#e8e2c8', X + 10, Y + 15, 5, 1); }
    if (at(x + 1, y) === T.ROAD && at(x - 1, y) !== T.ROAD && at(x + 2, y) !== T.ROAD) { rect(c, '#e8e2c8', X + 15, Y + 2, 1, 5); rect(c, '#e8e2c8', X + 15, Y + 10, 1, 5); }
    const z = M.zebra && M.zebra[x + ',' + y];
    if (z === 'v') for (let i = 0; i < 4; i++) rect(c, '#e9e9e9', X + 1 + i * 4, Y + 2, 2, 12);
    if (z === 'h') for (let i = 0; i < 4; i++) rect(c, '#e9e9e9', X + 2, Y + 1 + i * 4, 12, 2);
  } else if (t === T.WALK) {
    rect(c, '#cdc7bb', X, Y, TS, TS);
    rect(c, '#bbb4a6', X, Y, TS, 1); rect(c, '#bbb4a6', X, Y + 8, TS, 1);
    rect(c, '#bbb4a6', X, Y, 1, 8); rect(c, '#bbb4a6', X + 8, Y + 8, 1, 8);
    if (at(x, y + 1) === T.ROAD) rect(c, '#958f83', X, Y + 15, TS, 1);
    if (at(x, y - 1) === T.ROAD) rect(c, '#958f83', X, Y, TS, 1);
    if (at(x + 1, y) === T.ROAD) rect(c, '#958f83', X + 15, Y, 1, TS);
    if (at(x - 1, y) === T.ROAD) rect(c, '#958f83', X, Y, 1, TS);
    if (si === 3 && hash2(x, y, 3) < 0.3) rect(c, '#f4f7fa', X + 3, Y + 3, 6, 3);
  } else if (t === T.WATER) {
    rect(c, p.water, X, Y, TS, TS);
    for (let k = 0; k < 2; k++) rect(c, p.w2, X + Math.floor(hash2(x, y, k) * 11), Y + 3 + Math.floor(hash2(x, y, k + 4) * 10), 4, 1);
    const up = at(x, y - 1);
    if (up !== T.WATER && up !== T.BRIDGE && up !== T.RAIL) { rect(c, '#d8cc9a', X, Y, TS, 2); rect(c, shade(p.water, -0.2), X, Y + 2, TS, 1); }
  } else if (t === T.BRIDGE) {
    rect(c, '#a97c50', X, Y, TS, TS);
    for (let i = 0; i < 4; i++) rect(c, '#8a6340', X, Y + i * 4 + 3, TS, 1);
    if (at(x - 1, y) !== T.BRIDGE) rect(c, '#6b4a2e', X, Y, 2, TS);
    if (at(x + 1, y) !== T.BRIDGE) rect(c, '#6b4a2e', X + 14, Y, 2, TS);
  } else if (t === T.PATH) {
    rect(c, p.path, X, Y, TS, TS);
    for (let k = 0; k < 3; k++) rect(c, shade(p.path, -0.12), X + Math.floor(hash2(x, y, k) * 14), Y + Math.floor(hash2(x, y, k + 3) * 14), 2, 1);
  } else if (t === T.PLAZA) {
    rect(c, '#cbc3b3', X, Y, TS, TS);
    rect(c, '#b4ab99', X, Y, TS, 1); rect(c, '#b4ab99', X, Y, 1, TS);
    rect(c, '#b4ab99', X + 8, Y + 8, 8, 1); rect(c, '#b4ab99', X + 8, Y + 8, 1, 8);
  } else if (t === T.RAIL) {
    rect(c, '#7d7468', X, Y, TS, TS);
    for (let i = 0; i < 4; i++) rect(c, '#5a4632', X, Y + i * 4 + 1, TS, 2);       // tà vẹt
    rect(c, '#b8bec6', X + 3, Y, 2, TS); rect(c, '#b8bec6', X + 11, Y, 2, TS);      // ray
  } else if (t === T.PLATFORM) {
    rect(c, '#b9b3a6', X, Y, TS, TS); rect(c, '#a39d90', X, Y, 1, TS);
    if (at(x + 1, y) === T.RAIL || at(x - 1, y) === T.RAIL) rect(c, '#f2c230', at(x + 1, y) === T.RAIL ? X + 12 : X + 2, Y, 2, TS);
  } else if (t === T.CONCRETE || t === T.PARKING) {
    rect(c, t === T.PARKING ? '#5e636b' : '#a9a9a2', X, Y, TS, TS);
    for (let k = 0; k < 3; k++) rect(c, t === T.PARKING ? '#53575e' : '#9b9b94', X + Math.floor(hash2(x, y, k) * 15), Y + Math.floor(hash2(x, y, k + 2) * 15), 2, 1);
    if (t === T.PARKING && x % 2 === 0) rect(c, '#e9e9e9', X, Y + 2, 1, 12);
  } else drawIndoorTile(c, M, x, y, t, X, Y);
}

// ---------- trong nhà ----------
export function drawIndoorTile(c, M, x, y, t, X, Y) {
  const at = M.at;
  if (t === T.FWOOD) {
    rect(c, '#b88a5c', X, Y, TS, TS);
    for (let i = 0; i < 4; i++) rect(c, '#a87a4e', X, Y + i * 4 + 3, TS, 1);
    rect(c, '#a87a4e', X + ((y % 2) ? 5 : 11), Y, 1, TS);
  } else if (t === T.FTILE) {
    rect(c, '#e3e6e8', X, Y, TS, TS); rect(c, '#cdd2d6', X, Y, TS, 1); rect(c, '#cdd2d6', X, Y, 1, TS);
  } else if (t === T.FCONC) {
    rect(c, '#9ea3a6', X, Y, TS, TS);
    for (let k = 0; k < 2; k++) rect(c, '#92979a', X + Math.floor(hash2(x, y, k) * 14), Y + Math.floor(hash2(x, y, k + 4) * 14), 2, 1);
    if (M.lines && M.lines.has(y)) rect(c, '#e6c84a', X, Y + 7, TS, 2);   // vạch an toàn
  } else if (t === T.FTATAMI) {
    rect(c, '#c9c08a', X, Y, TS, TS); rect(c, '#b4ab74', X, Y, TS, 1); rect(c, '#b4ab74', X, Y, 1, TS);
    for (let i = 2; i < TS; i += 3) rect(c, '#bfb67f', X + 1, Y + i, TS - 1, 1);
  } else if (t === T.FCARPET) {
    rect(c, '#6f7d9c', X, Y, TS, TS);
    if (hash2(x, y, 5) < 0.4) rect(c, '#66738f', X + Math.floor(hash2(x, y, 6) * 14), Y + Math.floor(hash2(x, y, 7) * 14), 2, 2);
  } else if (t === T.FSOIL) {
    rect(c, '#7a5236', X, Y, TS, TS);
    for (let k = 0; k < 3; k++) rect(c, '#6a4630', X + Math.floor(hash2(x, y, k) * 14), Y + Math.floor(hash2(x, y, k + 3) * 14), 2, 1);
  } else if (t === T.WALL) {
    const below = at(x, y + 1);
    const face = below !== T.WALL && below !== T.VOID;
    rect(c, '#3b3f4c', X, Y, TS, TS);
    if (face) {
      rect(c, M.wall || '#e9e1cf', X, Y + 4, TS, 12);
      rect(c, shade(M.wall || '#e9e1cf', -0.15), X, Y + 14, TS, 2);
      rect(c, '#2e313c', X, Y, TS, 4);
    }
  } else if (t === T.DOOR) {
    rect(c, '#3b3f4c', X, Y, TS, TS);
    rect(c, '#6b4a2e', X + 2, Y + 2, 12, 14); rect(c, '#8a6340', X + 3, Y + 3, 10, 13);
    rect(c, '#f2c94c', X + 11, Y + 9, 1, 2);
  } else if (t === T.VOID) {
    rect(c, '#1b2238', X, Y, TS, TS);
  }
}

export function drawWindow(c, x, y, w, h) {
  rect(c, '#566075', x - 1, y - 1, w + 2, h + 2);
  rect(c, '#a8d4ee', x, y, w, h);
  rect(c, '#d9effb', x, y, w, 2);
  rect(c, '#566075', x + Math.floor(w / 2), y, 1, h);
}

export function drawBuilding(c, b, si) {
  const X = b.x * TS, Y = b.y * TS, W = b.w * TS, H = b.h * TS;
  const st = b.style;
  const roofH = Math.round(H * (st === 'shrine' ? 0.5 : st === 'office' ? 0.2 : st === 'warehouse' || st === 'plant' ? 0.3 : 0.42));
  const wallY = Y + roofH, wallH = H - roofH;
  rect(c, 'rgba(0,0,0,.18)', X + 2, Y + H, W, 3);
  if (st === 'site') { drawSite(c, b, si); return; }
  rect(c, b.wall, X, wallY, W, wallH);
  rect(c, shade(b.wall, -0.2), X, Y + H - 2, W, 2);
  rect(c, shade(b.wall, -0.08), X, wallY, 2, wallH);
  const rx = st === 'shrine' ? X - 5 : X - 1, rw = st === 'shrine' ? W + 10 : W + 2;
  rect(c, b.roof, rx, Y, rw, roofH);
  for (let yy = Y + 4; yy < Y + roofH - 2; yy += 4) rect(c, shade(b.roof, -0.16), rx, yy, rw, 1);
  rect(c, shade(b.roof, 0.2), rx, Y, rw, 2);
  rect(c, shade(b.roof, -0.38), rx, Y + roofH - 2, rw, 2);
  if (st === 'shrine') { rect(c, b.roof, rx - 2, Y + roofH - 5, 3, 3); rect(c, b.roof, rx + rw - 1, Y + roofH - 5, 3, 3); }
  if (si === 3) { rect(c, '#f3f7fa', rx, Y, rw, 4); for (let i = 0; i < rw; i += 5) rect(c, '#f3f7fa', rx + i, Y + 4, 2, 1 + ((i / 5) % 3)); }
  if (st === 'factory' || st === 'plant') {
    rect(c, '#6d7378', X + 10, Y - 10, 7, 14); rect(c, '#8a9095', X + 10, Y - 10, 7, 2);
    if (st === 'plant') { rect(c, '#6d7378', X + 22, Y - 14, 7, 18); rect(c, '#8a9095', X + 22, Y - 14, 7, 2); }
    rect(c, '#5b6166', X + W - 46, Y + H - 22, 34, 20);
    for (let i = 0; i < 9; i++) rect(c, '#4a4f54', X + W - 46, Y + H - 21 + i * 2, 34, 1);
  }
  if (st === 'warehouse') for (let i = 0; i < 3; i++) {
    const sx = X + 10 + i * Math.floor((W - 30) / 3);
    rect(c, '#5b6166', sx, Y + H - 26, 30, 24);
    for (let j = 0; j < 11; j++) rect(c, '#4a4f54', sx, Y + H - 25 + j * 2, 30, 1);
  }
  if (st === 'konbini') { rect(c, '#7b4bd1', X, wallY, W, 3); rect(c, '#f2c230', X, wallY + 3, W, 2); }
  if (st === 'station') { rect(c, '#2f6db5', X, wallY, W, 3); }
  const sw = Math.min(W - 10, 72), sx = X + Math.round((W - sw) / 2), sy = wallY + (st === 'konbini' ? 6 : 3);
  rect(c, st === 'shrine' ? '#3a2f2a' : st === 'ramen' ? '#7a1f1a' : '#2b2f3a', sx, sy, sw, 10);
  rect(c, '#4a5163', sx, sy, sw, 1);
  b.sign = { x: sx + sw / 2, y: sy + 5.5 };
  const winY = sy + 14;
  if (st === 'office') {
    for (let row = winY; row < Y + H - 20; row += 12) for (let i = 0; i < b.w; i++) { rect(c, '#2e4a66', X + i * TS + 2, row, 12, 9); rect(c, '#6fa3cf', X + i * TS + 3, row + 1, 10, 3); }
  } else if (st !== 'shrine' && st !== 'warehouse') {
    for (let i = 0; i < b.w; i++) {
      if (b.x + i === b.door) continue;
      if ((st === 'factory' || st === 'plant') && i >= b.w - 3) continue;
      if (winY + 8 < Y + H - 4) drawWindow(c, X + i * TS + 3, winY, 10, 7);
      if ((st === 'dorm' || st === 'care' || st === 'apt') && winY + 26 < Y + H - 2) {
        drawWindow(c, X + i * TS + 3, winY + 18, 10, 7);
        rect(c, '#8b8f97', X + i * TS + 1, winY + 9, 14, 1);
      }
    }
  } else if (st === 'shrine') for (let i = 0; i < 4; i++) rect(c, '#e8d9b0', X + 4 + i * 20, wallY + 4, 2, wallH - 6);
  const dx = b.door * TS + 2, dy = Y + H - 14;
  if (st === 'dorm' || st === 'hall' || st === 'apt') {
    rect(c, '#5e3c24', dx - 1, dy - 1, 14, 15); rect(c, '#7a4f30', dx, dy, 12, 14); rect(c, '#f2c94c', dx + 9, dy + 7, 1, 2);
  } else if (st === 'shrine') {
    rect(c, '#3a2f2a', dx - 2, dy - 2, 16, 16); rect(c, '#e8d9b0', dx, dy, 12, 14);
    for (let i = 0; i < 3; i++) rect(c, '#8a7a5a', dx, dy + 3 + i * 4, 12, 1);
  } else if (st === 'ramen') {
    rect(c, '#3a2a20', dx - 1, dy - 1, 14, 15); rect(c, '#c9a77a', dx, dy, 12, 14);
    for (let i = 0; i < 3; i++) rect(c, '#1e2a5a', dx - 3 + i * 6, dy - 3, 5, 8); // rèm noren
  } else {
    rect(c, '#4a505e', dx - 1, dy - 1, 14, 15); rect(c, '#9fd0ea', dx, dy, 12, 14);
    rect(c, '#4a505e', dx + 6, dy, 1, 14); rect(c, '#d4ecf8', dx, dy, 12, 2);
  }
  if (st === 'shop') for (let i = 0; i < 6; i++) rect(c, i % 2 ? '#ffffff' : b.roof, dx - 4 + i * 4, dy - 5, 4, 3);
  if (st === 'clinic' || st === 'care') { rect(c, '#ffffff', X + 4, sy, 9, 9); rect(c, '#3aa35f', X + 7, sy + 1, 3, 7); rect(c, '#3aa35f', X + 5, sy + 3, 7, 3); }
  if (st === 'ramen') { rect(c, '#d9362b', X + 4, wallY + 16, 5, 8); rect(c, '#d9362b', X + W - 9, wallY + 16, 5, 8); } // đèn lồng
}

function drawSite(c, b, si) {
  const X = b.x * TS, Y = b.y * TS, W = b.w * TS, H = b.h * TS;
  rect(c, '#a39a86', X, Y, W, H);
  for (let k = 0; k < 40; k++) rect(c, '#958b76', X + Math.floor(hash2(k, b.x, 3) * W), Y + Math.floor(hash2(k, b.y, 4) * H), 3, 1);
  // khung thép đang dựng
  for (let i = 0; i < 4; i++) { rect(c, '#e9a23b', X + 14 + i * 22, Y + 10, 3, H - 34); }
  for (let j = 0; j < 4; j++) rect(c, '#e9a23b', X + 14, Y + 14 + j * 14, 69, 3);
  // cần cẩu
  rect(c, '#f2c230', X + W - 30, Y - 22, 4, H - 10); rect(c, '#f2c230', X + W - 80, Y - 22, 70, 3);
  rect(c, '#333', X + W - 70, Y - 19, 1, 26);
  // hàng rào + bảng an toàn
  rect(c, '#e8e3d0', X, Y + H - 14, W, 12); for (let i = 0; i < W; i += 12) rect(c, '#2f6db5', X + i, Y + H - 14, 6, 12);
  const sw = 62, sx = X + 6, sy = Y + H - 30;
  rect(c, '#2b2f3a', sx, sy, sw, 10);
  b.sign = { x: sx + sw / 2, y: sy + 5.5 };
  const dx = b.door * TS + 2;
  rect(c, '#555', dx - 2, Y + H - 16, 16, 16); rect(c, '#a39a86', dx, Y + H - 14, 12, 14);
}

export function drawTree(c, x, y, si, park) {
  const X = x * TS, Y = y * TS, h = hash2(x, y, 11);
  rect(c, 'rgba(0,0,0,.2)', X + 3, Y + 13, 11, 3);
  rect(c, '#6b4a2e', X + 7, Y + 8, 3, 7);
  let a, b2;
  if (si === 0) [a, b2] = park && h < 0.6 ? ['#f3b6c8', '#e58aa8'] : ['#5aa64a', '#3f7d3a'];
  else if (si === 1) [a, b2] = ['#3f9442', '#2c6e31'];
  else if (si === 2) [a, b2] = h < 0.33 ? ['#e57d3a', '#b85a28'] : h < 0.66 ? ['#d24b3c', '#9c3229'] : ['#e5b53e', '#b88a26'];
  else {
    if (h < 0.45) { disc(c, '#2f5a3c', X + 8, Y + 4, 7); disc(c, '#f4f8fb', X + 7, Y + 1, 4); return; }
    rect(c, '#6b4a2e', X + 4, Y + 2, 1, 6); rect(c, '#6b4a2e', X + 11, Y + 1, 1, 7);
    rect(c, '#6b4a2e', X + 5, Y + 6, 3, 1); rect(c, '#6b4a2e', X + 9, Y + 5, 3, 1);
    rect(c, '#f4f8fb', X + 3, Y + 1, 3, 1); rect(c, '#f4f8fb', X + 10, Y, 3, 1);
    return;
  }
  disc(c, b2, X + 8, Y + 5, 7);
  disc(c, a, X + 7, Y + 4, 6);
  rect(c, shade(a, 0.25), X + 4, Y + 1, 3, 2);
}

export function drawLamp(c, lx, ly) {
  const px = lx * TS + 13, py = ly * TS;
  rect(c, '#3c4048', px, py - 6, 1, 15); rect(c, '#3c4048', px - 2, py - 7, 4, 2); rect(c, '#f6e6a8', px - 1, py - 5, 3, 1);
}
