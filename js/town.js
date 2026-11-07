// Thị trấn Hikari-chō: bản đồ ô vuông, vẽ, di chuyển, người đi đường, ngày/đêm, thời tiết.
import { G, seasonIdx, tickNeeds, TIME_RATE, isWorkday, dow, MIDNIGHT, isNewYear } from './state.js';
import { canRegister } from './exam.js';
import { availableTest, testBlockReason, TESTS } from './career.js';
import { input } from './input.js';
import { TS, FONT, hash2, rect, disc, shade, pick, text, pill, drawPerson, drawCat, drawCar } from './pixel.js';
import { JOBS, LOOK } from './data.js';

export const MW = 44, MH = 38;
const GRASS = 0, ROAD = 1, WALK = 2, WATER = 3, BRIDGE = 4, TREE = 5, FLOWER = 6, PATH = 7, PLAZA = 8, BLD = 9;
const SOLID = new Set([WATER, TREE, BLD]);

export const BUILDINGS = [
  { id: 'dorm', name: 'Ký túc xá', jp: '寮', x: 2, y: 5, w: 7, h: 6, door: 5, wall: '#e6d8bf', roof: '#7a5240', style: 'dorm' },
  { id: 'konbini', name: 'Konbini', jp: 'コンビニ', x: 11, y: 7, w: 6, h: 4, door: 13, wall: '#f4f3ee', roof: '#3d3a52', style: 'konbini' },
  { id: 'work', name: 'Chỗ làm', jp: '会社', x: 24, y: 4, w: 10, h: 7, door: 28, wall: '#cdd5dc', roof: '#46617a', style: 'factory' },
  { id: 'clinic', name: 'Phòng khám', jp: 'クリニック', x: 36, y: 7, w: 6, h: 4, door: 38, wall: '#f0f5f6', roof: '#4b8a86', style: 'clinic' },
  { id: 'super', name: 'Siêu thị', jp: 'スーパー', x: 1, y: 18, w: 7, h: 5, door: 4, wall: '#f5eedf', roof: '#b5533c', style: 'shop' },
  { id: 'class', name: 'Lớp tiếng Nhật', jp: '日本語教室', x: 10, y: 18, w: 7, h: 5, door: 13, wall: '#ece3cf', roof: '#5d7a4c', style: 'hall' },
  { id: 'remit', name: 'Chuyển tiền', jp: '送金', x: 24, y: 19, w: 6, h: 4, door: 26, wall: '#e6edf5', roof: '#2f5d8a', style: 'shop' },
  { id: 'shrine', name: 'Đền Hikari', jp: '神社', x: 34, y: 17, w: 5, h: 4, door: 36, wall: '#b8382b', roof: '#3a2f2a', style: 'shrine' },
];
export const SPOTS = [
  { id: 'park', tx: 12, ty: 30, name: 'Công viên' },
  { id: 'river', tx: 30, ty: 34, name: 'Bờ sông' },
];
const NPCS = [
  { id: 'sato', name: 'Bà Sato', look: { hair: '#d4d4da', shirt: '#8b6f9c', pants: '#5a4a5e', skin: '#f1d3b5', gender: 'f' } },
  { id: 'long', name: 'Anh Long', look: { hair: '#1e1a1a', shirt: '#3f88c5', pants: '#2f3a56', skin: '#e2b48c', gender: 'm' } },
  { id: 'cat', name: 'Mèo mướp', cat: true },
];

export function buildingName(b, S) { return b.id === 'work' && S ? JOBS[S.job].place : b.name; }
export const entrance = (b) => ({ x: b.door * TS + 8, y: (b.y + b.h) * TS + 10 });

// ---------- bản đồ ----------
const map = new Uint8Array(MW * MH);
const decorSolid = new Set();
const lamps = [];
const at = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH ? BLD : map[y * MW + x]);
const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < MW && y < MH) map[y * MW + x] = t; };

function buildMap() {
  map.fill(GRASS);
  for (let x = 0; x < MW; x++) {
    set(x, 12, WALK); set(x, 13, ROAD); set(x, 14, ROAD); set(x, 15, WALK);
    set(x, 24, WALK); set(x, 25, ROAD); set(x, 26, ROAD); set(x, 27, WALK);
  }
  for (let y = 0; y <= 34; y++) {
    set(19, y, at(19, y) === ROAD ? ROAD : WALK);
    set(22, y, at(22, y) === ROAD ? ROAD : WALK);
    set(20, y, ROAD); set(21, y, ROAD);
  }
  for (let y = 35; y < MH; y++) for (let x = 0; x < MW; x++) set(x, y, x >= 19 && x <= 22 ? BRIDGE : WATER);
  for (let y = 30; y <= 32; y++) for (let x = 3; x <= 8; x++) if (!((y === 30 || y === 32) && (x === 3 || x === 8))) set(x, y, WATER);
  for (let y = 21; y <= 23; y++) for (let x = 33; x <= 39; x++) set(x, y, PLAZA);
  for (let x = 10; x <= 18; x++) set(x, 31, PATH);
  for (let x = 23; x <= 30; x++) set(x, 33, PATH);
  set(30, 34, PATH);
  for (const b of BUILDINGS) {
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) set(x, y, BLD);
    for (let y = b.y + b.h; y < MH && at(b.door, y) === GRASS; y++) set(b.door, y, PATH);
  }
  // ô không được trồng cây
  const keep = new Set();
  const reserve = (x, y, r = 1) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) keep.add((x + dx) + ',' + (y + dy)); };
  for (const b of BUILDINGS) reserve(b.door, b.y + b.h);
  for (const s of SPOTS) reserve(s.tx, s.ty);
  [[9, 11], [17, 11], [14, 30], [9, 29], [12, 31]].forEach(([x, y]) => reserve(x, y));
  for (let x = 0; x < MW; x += 2) if (at(x, 0) === GRASS) set(x, 0, TREE);
  for (let y = 1; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (at(x, y) !== GRASS || keep.has(x + ',' + y)) continue;
    const h = hash2(x, y, 7);
    const park = y >= 28 && y <= 34;
    if (park ? h < 0.17 : h < 0.035) set(x, y, TREE);
    else if (h > 0.94) set(x, y, FLOWER);
  }
  for (let y = 16; y <= 21; y++) { if (at(32, y) === GRASS) set(32, y, TREE); if (at(40, y) === GRASS) set(40, y, TREE); }
  for (let x = 32; x <= 40; x++) if (at(x, 16) === GRASS) set(x, 16, TREE);
  // đồ trang trí chắn đường
  decorSolid.clear();
  ['17,10', '9,10', '35,23', '37,23'].forEach((k) => decorSolid.add(k));
  lamps.length = 0;
  for (const x of [3, 10, 16, 26, 33, 40]) { lamps.push([x, 12]); lamps.push([x, 24]); }
  lamps.push([16, 30], [25, 32], [11, 27], [31, 27]);
}

function solidPx(px, py) {
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
  return SOLID.has(map[ty * MW + tx]) || decorSolid.has(tx + ',' + ty);
}
const blocked = (x, y) => solidPx(x - 4, y - 4) || solidPx(x + 4, y - 4) || solidPx(x - 4, y) || solidPx(x + 4, y);

// ---------- vẽ bản đồ tĩnh (mỗi mùa một lần) ----------
const PAL = [
  { grass: '#8cc46e', g2: '#7ab35f', g3: '#a6d68a', path: '#d6b98e', water: '#4a8fd0', w2: '#78b5e8', fl: ['#f7a8c4', '#ffffff', '#ffd75e'] },
  { grass: '#5fae4e', g2: '#4f9c41', g3: '#76c264', path: '#cfae7f', water: '#3f86cc', w2: '#70b0e6', fl: ['#6aa6ff', '#ffd75e', '#ffffff'] },
  { grass: '#b4a65a', g2: '#a1924a', g3: '#c8b86a', path: '#c9a678', water: '#4a82b8', w2: '#7aa9d6', fl: ['#e0463c', '#f2a03d'] },
  { grass: '#e8eef2', g2: '#d3dce4', g3: '#ffffff', path: '#d9d4cc', water: '#6d9cc2', w2: '#a9c8e0', fl: [] },
];
let mapCanvas = null, mapSeason = -1;

function drawGround(c, si) {
  const p = PAL[si];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const t = at(x, y), X = x * TS, Y = y * TS;
    if (t === GRASS || t === TREE || t === FLOWER || t === BLD) {
      rect(c, p.grass, X, Y, TS, TS);
      for (let k = 0; k < 4; k++) {
        const hx = Math.floor(hash2(x, y, k) * 15), hy = Math.floor(hash2(x, y, k + 9) * 14);
        rect(c, k % 2 ? p.g2 : p.g3, X + hx, Y + hy, 1, 2);
      }
      if (t === FLOWER && p.fl.length) for (let k = 0; k < 3; k++) {
        const hx = 2 + Math.floor(hash2(x, y, k + 20) * 11), hy = 2 + Math.floor(hash2(x, y, k + 30) * 11);
        rect(c, p.fl[k % p.fl.length], X + hx, Y + hy, 2, 2);
        rect(c, '#3f7d3a', X + hx, Y + hy + 2, 1, 1);
      }
    } else if (t === ROAD) {
      rect(c, '#575c66', X, Y, TS, TS);
      for (let k = 0; k < 3; k++) rect(c, '#4d525b', X + Math.floor(hash2(x, y, k) * 15), Y + Math.floor(hash2(x, y, k + 5) * 15), 1, 1);
      const vert = x === 20 || x === 21, horz = y === 13 || y === 14 || y === 25 || y === 26;
      if ((y === 13 || y === 25) && !(x >= 19 && x <= 22)) { rect(c, '#e8e2c8', X + 2, Y + 15, 5, 1); rect(c, '#e8e2c8', X + 10, Y + 15, 5, 1); }
      if (x === 20 && !horz && !(y === 12 || y === 15 || y === 24 || y === 27)) { rect(c, '#e8e2c8', X + 15, Y + 2, 1, 5); rect(c, '#e8e2c8', X + 15, Y + 10, 1, 5); }
      if (vert && (y === 12 || y === 15 || y === 24 || y === 27)) for (let i = 0; i < 4; i++) rect(c, '#e9e9e9', X + 1 + i * 4, Y + 2, 2, 12);
      if ((x === 19 || x === 22) && horz) for (let i = 0; i < 4; i++) rect(c, '#e9e9e9', X + 2, Y + 1 + i * 4, 12, 2);
    } else if (t === WALK) {
      rect(c, '#cdc7bb', X, Y, TS, TS);
      rect(c, '#bbb4a6', X, Y, TS, 1); rect(c, '#bbb4a6', X, Y + 8, TS, 1);
      rect(c, '#bbb4a6', X, Y, 1, 8); rect(c, '#bbb4a6', X + 8, Y + 8, 1, 8);
      if (at(x, y + 1) === ROAD) rect(c, '#958f83', X, Y + 15, TS, 1);
      if (at(x, y - 1) === ROAD) rect(c, '#958f83', X, Y, TS, 1);
      if (at(x + 1, y) === ROAD) rect(c, '#958f83', X + 15, Y, 1, TS);
      if (at(x - 1, y) === ROAD) rect(c, '#958f83', X, Y, 1, TS);
      if (si === 3 && hash2(x, y, 3) < 0.3) rect(c, '#f4f7fa', X + 3, Y + 3, 6, 3);
    } else if (t === WATER) {
      rect(c, p.water, X, Y, TS, TS);
      for (let k = 0; k < 2; k++) rect(c, p.w2, X + Math.floor(hash2(x, y, k) * 11), Y + 3 + Math.floor(hash2(x, y, k + 4) * 10), 4, 1);
      const up = at(x, y - 1);
      if (up !== WATER && up !== BRIDGE) { rect(c, '#d8cc9a', X, Y, TS, 2); rect(c, shade(p.water, -0.2), X, Y + 2, TS, 1); }
    } else if (t === BRIDGE) {
      rect(c, '#a97c50', X, Y, TS, TS);
      for (let i = 0; i < 4; i++) rect(c, '#8a6340', X, Y + i * 4 + 3, TS, 1);
      if (x === 19) rect(c, '#6b4a2e', X, Y, 2, TS);
      if (x === 22) rect(c, '#6b4a2e', X + 14, Y, 2, TS);
    } else if (t === PATH) {
      rect(c, p.path, X, Y, TS, TS);
      for (let k = 0; k < 3; k++) rect(c, shade(p.path, -0.12), X + Math.floor(hash2(x, y, k) * 14), Y + Math.floor(hash2(x, y, k + 3) * 14), 2, 1);
    } else if (t === PLAZA) {
      rect(c, '#cbc3b3', X, Y, TS, TS);
      rect(c, '#b4ab99', X, Y, TS, 1); rect(c, '#b4ab99', X, Y, 1, TS);
      rect(c, '#b4ab99', X + 8, Y + 8, 8, 1); rect(c, '#b4ab99', X + 8, Y + 8, 1, 8);
    }
  }
}

function drawWindow(c, x, y, w, h) {
  rect(c, '#566075', x - 1, y - 1, w + 2, h + 2);
  rect(c, '#a8d4ee', x, y, w, h);
  rect(c, '#d9effb', x, y, w, 2);
  rect(c, '#566075', x + Math.floor(w / 2), y, 1, h);
}

function drawBuilding(c, b, si) {
  const X = b.x * TS, Y = b.y * TS, W = b.w * TS, H = b.h * TS;
  const roofH = Math.round(H * (b.style === 'shrine' ? 0.5 : 0.42));
  const wallY = Y + roofH, wallH = H - roofH;
  rect(c, 'rgba(0,0,0,.18)', X + 2, Y + H, W, 3);
  rect(c, b.wall, X, wallY, W, wallH);
  rect(c, shade(b.wall, -0.2), X, Y + H - 2, W, 2);
  rect(c, shade(b.wall, -0.08), X, wallY, 2, wallH);
  // mái
  const rx = b.style === 'shrine' ? X - 5 : X - 1, rw = b.style === 'shrine' ? W + 10 : W + 2;
  rect(c, b.roof, rx, Y, rw, roofH);
  for (let yy = Y + 4; yy < Y + roofH - 2; yy += 4) rect(c, shade(b.roof, -0.16), rx, yy, rw, 1);
  rect(c, shade(b.roof, 0.2), rx, Y, rw, 2);
  rect(c, shade(b.roof, -0.38), rx, Y + roofH - 2, rw, 2);
  if (b.style === 'shrine') { rect(c, b.roof, rx - 2, Y + roofH - 5, 3, 3); rect(c, b.roof, rx + rw - 1, Y + roofH - 5, 3, 3); }
  if (si === 3) {
    rect(c, '#f3f7fa', rx, Y, rw, 4);
    for (let i = 0; i < rw; i += 5) rect(c, '#f3f7fa', rx + i, Y + 4, 2, 1 + ((i / 5) % 3));
  }
  if (b.style === 'factory') {
    rect(c, '#6d7378', X + 10, Y - 10, 7, 14); rect(c, '#8a9095', X + 10, Y - 10, 7, 2);
    rect(c, '#5b6166', X + W - 46, Y + H - 22, 34, 20);
    for (let i = 0; i < 9; i++) rect(c, '#4a4f54', X + W - 46, Y + H - 21 + i * 2, 34, 1);
  }
  if (b.style === 'konbini') {
    rect(c, '#7b4bd1', X, wallY, W, 3);
    rect(c, '#f2c230', X, wallY + 3, W, 2);
  }
  // bảng hiệu (chữ vẽ sau, mỗi khung hình)
  const sw = Math.min(W - 10, 66), sx = X + Math.round((W - sw) / 2), sy = wallY + (b.style === 'konbini' ? 6 : 3);
  rect(c, b.style === 'shrine' ? '#3a2f2a' : '#2b2f3a', sx, sy, sw, 10);
  rect(c, '#4a5163', sx, sy, sw, 1);
  b.sign = { x: sx + sw / 2, y: sy + 5.5 };
  // cửa sổ
  const winY = sy + 14;
  if (b.style !== 'shrine') {
    for (let i = 0; i < b.w; i++) {
      if (b.x + i === b.door) continue;
      if (b.style === 'factory' && i >= b.w - 3) continue;
      if (winY + 8 < Y + H - 4) drawWindow(c, X + i * TS + 3, winY, 10, 7);
      if (b.style === 'dorm' && winY + 26 < Y + H - 2) {
        drawWindow(c, X + i * TS + 3, winY + 18, 10, 7);
        rect(c, '#8b8f97', X + i * TS + 1, winY + 9, 14, 1);
        rect(c, '#8b8f97', X + i * TS + 1, winY + 9, 1, 4); rect(c, '#8b8f97', X + i * TS + 14, winY + 9, 1, 4);
      }
    }
  } else {
    for (let i = 0; i < 4; i++) rect(c, '#e8d9b0', X + 4 + i * 20, wallY + 4, 2, wallH - 6);
  }
  // cửa ra vào
  const dx = b.door * TS + 2, dy = Y + H - 14;
  if (b.style === 'dorm' || b.style === 'hall') {
    rect(c, '#5e3c24', dx - 1, dy - 1, 14, 15); rect(c, '#7a4f30', dx, dy, 12, 14); rect(c, '#f2c94c', dx + 9, dy + 7, 1, 2);
  } else if (b.style === 'shrine') {
    rect(c, '#3a2f2a', dx - 2, dy - 2, 16, 16); rect(c, '#e8d9b0', dx, dy, 12, 14);
    for (let i = 0; i < 3; i++) rect(c, '#8a7a5a', dx, dy + 3 + i * 4, 12, 1);
  } else {
    rect(c, '#4a505e', dx - 1, dy - 1, 14, 15); rect(c, '#9fd0ea', dx, dy, 12, 14);
    rect(c, '#4a505e', dx + 6, dy, 1, 14); rect(c, '#d4ecf8', dx, dy, 12, 2);
  }
  if (b.style === 'shop') {
    for (let i = 0; i < 6; i++) rect(c, i % 2 ? '#ffffff' : b.roof, dx - 4 + i * 4, dy - 5, 4, 3);
  }
  if (b.style === 'clinic') {
    rect(c, '#ffffff', X + 4, sy, 9, 9); rect(c, '#3aa35f', X + 7, sy + 1, 3, 7); rect(c, '#3aa35f', X + 5, sy + 3, 7, 3);
  }
}

function drawTree(c, x, y, si) {
  const X = x * TS, Y = y * TS, h = hash2(x, y, 11);
  rect(c, 'rgba(0,0,0,.2)', X + 3, Y + 13, 11, 3);
  rect(c, '#6b4a2e', X + 7, Y + 8, 3, 7);
  const park = y >= 28;
  let a, b2;
  if (si === 0) [a, b2] = park && h < 0.6 ? ['#f3b6c8', '#e58aa8'] : ['#5aa64a', '#3f7d3a'];
  else if (si === 1) [a, b2] = ['#3f9442', '#2c6e31'];
  else if (si === 2) [a, b2] = h < 0.33 ? ['#e57d3a', '#b85a28'] : h < 0.66 ? ['#d24b3c', '#9c3229'] : ['#e5b53e', '#b88a26'];
  else {
    if (h < 0.45) { // cây thông có tuyết
      disc(c, '#2f5a3c', X + 8, Y + 4, 7); disc(c, '#f4f8fb', X + 7, Y + 1, 4); return;
    }
    rect(c, '#6b4a2e', X + 4, Y + 2, 1, 6); rect(c, '#6b4a2e', X + 11, Y + 1, 1, 7);
    rect(c, '#6b4a2e', X + 5, Y + 6, 3, 1); rect(c, '#6b4a2e', X + 9, Y + 5, 3, 1);
    rect(c, '#f4f8fb', X + 3, Y + 1, 3, 1); rect(c, '#f4f8fb', X + 10, Y, 3, 1);
    return;
  }
  disc(c, b2, X + 8, Y + 5, 7);
  disc(c, a, X + 7, Y + 4, 6);
  rect(c, shade(a, 0.25), X + 4, Y + 1, 3, 2);
}

function drawDecor(c, si) {
  // trạm rác cạnh ký túc xá
  let X = 9 * TS, Y = 10 * TS;
  rect(c, '#3f6b55', X + 1, Y + 3, 14, 12); rect(c, '#2e5442', X + 1, Y + 3, 14, 2);
  rect(c, '#e8e8e8', X + 3, Y + 7, 5, 6); rect(c, '#9cc3e6', X + 8, Y + 8, 5, 5);
  // máy bán hàng tự động
  X = 17 * TS; Y = 10 * TS;
  rect(c, '#c0392b', X + 2, Y, 12, 15); rect(c, '#ecf0f1', X + 4, Y + 2, 8, 6);
  for (let i = 0; i < 4; i++) rect(c, ['#3498db', '#e67e22', '#2ecc71', '#f1c40f'][i], X + 4 + i * 2, Y + 3, 1, 4);
  rect(c, '#2c3e50', X + 5, Y + 10, 6, 2);
  // ghế đá công viên
  X = 12 * TS; Y = 30 * TS;
  rect(c, '#8a5a35', X + 1, Y + 6, 14, 3); rect(c, '#6b4428', X + 1, Y + 3, 14, 2);
  rect(c, '#555', X + 2, Y + 9, 1, 3); rect(c, '#555', X + 13, Y + 9, 1, 3);
  // lá sen trên hồ
  if (si !== 3) for (const [lx, ly] of [[4, 31], [6, 30], [7, 31]]) disc(c, '#4f9a4a', lx * TS + 8, ly * TS + 8, 3);
  // cổng torii
  X = 35 * TS; Y = 23 * TS;
  rect(c, '#c8352a', X + 6, Y - 10, 3, 24); rect(c, '#c8352a', X + 39, Y - 10, 3, 24);
  rect(c, '#2b2220', X, Y - 14, 48, 3); rect(c, '#c8352a', X + 2, Y - 11, 44, 2); rect(c, '#c8352a', X + 4, Y - 6, 40, 2);
  // cột đèn
  for (const [lx, ly] of lamps) {
    const px = lx * TS + 13, py = ly * TS;
    rect(c, '#3c4048', px, py - 6, 1, 15); rect(c, '#3c4048', px - 2, py - 7, 4, 2); rect(c, '#f6e6a8', px - 1, py - 5, 3, 1);
  }
}

function ensureMap(si) {
  if (mapCanvas && mapSeason === si) return;
  mapCanvas = mapCanvas || document.createElement('canvas');
  mapCanvas.width = MW * TS; mapCanvas.height = MH * TS;
  const c = mapCanvas.getContext('2d');
  drawGround(c, si);
  for (const b of BUILDINGS) drawBuilding(c, b, si);
  drawDecor(c, si);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (at(x, y) === TREE) drawTree(c, x, y, si);
  mapSeason = si;
}

// ---------- thực thể động ----------
const H_LANES = [12, 15, 24, 27], V_LANES = [19, 22];
const walkers = [], cars = [];
const CAR_COLORS = ['#e74c3c', '#ecf0f1', '#2c3e50', '#3498db', '#f1c40f', '#95a5a6', '#27ae60'];
const CAR_LANES = [
  { h: true, at: 13, d: -1 }, { h: true, at: 14, d: 1 }, { h: true, at: 25, d: -1 }, { h: true, at: 26, d: 1 },
  { h: false, at: 20, d: 1 }, { h: false, at: 21, d: -1 },
];
function randomLook() {
  return { hair: pick(LOOK.hair), shirt: pick(LOOK.shirt), pants: pick(LOOK.pants), skin: pick(LOOK.skin), gender: Math.random() < 0.5 ? 'f' : 'm' };
}
function spawnAmbient() {
  walkers.length = 0; cars.length = 0;
  for (let i = 0; i < 7; i++) {
    const horiz = i < 5;
    const lane = horiz ? H_LANES[i % 4] : V_LANES[i % 2];
    const len = horiz ? MW * TS : 35 * TS;
    walkers.push({ horiz, lane, p: Math.random() * len, len, d: Math.random() < 0.5 ? 1 : -1, sp: 14 + Math.random() * 10, look: randomLook(), t: Math.random() * 5 });
  }
  for (let i = 0; i < 5; i++) {
    const L = CAR_LANES[i % CAR_LANES.length];
    const len = L.h ? MW * TS : 38 * TS;
    cars.push({ L, p: Math.random() * len, len, sp: 45 + Math.random() * 25, col: pick(CAR_COLORS), wait: 0 });
  }
}

function npcPos(S) {
  const out = [];
  const t = S.time, d = dow(S), weekend = d >= 5;
  if (t >= 7 * 60 && t < 19 * 60) out.push({ ...NPCS[0], x: 9 * TS + 8, y: 11 * TS + 12, dir: 'down' });
  if (weekend && t >= 10 * 60 && t < 17 * 60) out.push({ ...NPCS[1], x: 14 * TS + 8, y: 30 * TS + 12, dir: 'left' });
  else if (t >= 17.5 * 60 && t < 22.5 * 60) out.push({ ...NPCS[1], x: 17 * TS + 8, y: 11 * TS + 12, dir: 'down' });
  out.push({ ...NPCS[2], x: 9 * TS + 8, y: 29 * TS + 12 });
  return out;
}

// ---------- mục tiêu gợi ý ----------
export function objective(S) {
  const t = S.time;
  if (t >= 22 * 60) return { text: '🌙 Khuya rồi — về Ký túc xá ngủ trước 0:00', target: 'dorm' };
  if (isWorkday(S) && !S.worked && !S.today.noWork && !S.today.sickLeave && t <= 10 * 60)
    return { text: t <= 8 * 60 ? `🏭 Đến ${JOBS[S.job].place} trước 08:00` : '🏃 Muộn rồi! Chạy nhanh đến chỗ làm!', target: 'work' };
  const tid = availableTest(S);
  if (tid && isWorkday(S) && !S.worked && t <= 10 * 60 && !testBlockReason(S, tid))
    return { text: `📋 Có thể thi tay nghề ${TESTS[tid].name} ở chỗ làm${tid === 'kiso' ? ' — bắt buộc để gia hạn visa!' : ''}`, target: 'work' };
  if (S.career.visa === 'tts1' && !S.career.passed.kiso && S.career.end - S.day <= 9)
    return { text: '❗ Visa sắp hết — phải đỗ thi tay nghề 基礎級 (ngày thường, trước 10:00, ở chỗ làm)', target: 'work' };
  if (S.sick > 0) return { text: '🤒 Bạn đang ốm — đến phòng khám hoặc mua thuốc ở konbini', target: t >= 9 * 60 && t < 18 * 60 && dow(S) !== 6 ? 'clinic' : 'konbini' };
  if (S.full < 25) return { text: '🍙 Đói bụng — mua đồ ăn ở konbini / siêu thị hoặc về nấu', target: 'konbini' };
  if (S.energy < 20) return { text: '😪 Kiệt sức — về ký túc xá nghỉ ngơi', target: 'dorm' };
  if (S.today.matsuri && t >= 17 * 60) return { text: '🏮 Lễ hội mùa hè đang diễn ra ở công viên!', target: 'park' };
  if (isNewYear(S)) return { text: '⛩️ Năm mới — ghé đền đi lễ đầu năm', target: 'shrine' };
  if (S.exam && !S.exam.taken) return { text: `📝 Đã đăng ký thi JLPT ${S.exam.lv} — ôn bài ở lớp hoặc tự học trong ký túc xá`, target: (dow(S) < 5 && t >= 17.5 * 60 && t < 21 * 60) || (dow(S) >= 5 && t >= 10 * 60 && t < 17 * 60) ? 'class' : 'dorm' };
  if (canRegister(S)) return { text: '📝 Đang mở đăng ký thi JLPT — đăng ký qua mạng ở ký túc xá', target: 'dorm' };
  if (dow(S) === 5 && !S.worked && t <= 9 * 60) return { text: '⏱️ Thứ Bảy: có thể làm thêm buổi sáng (đến trước 09:00)', target: 'work' };
  if (S.money >= 25000 && S.debt > 0 && t >= 10 * 60 && t < 19 * 60) return { text: '💸 Có tiền rồi — ghé tiệm chuyển tiền gửi về trả nợ', target: 'remit' };
  if (!S.today.class && ((dow(S) < 5 && t >= 17.5 * 60 && t < 21 * 60) || (dow(S) >= 5 && t >= 10 * 60 && t < 17 * 60)))
    return { text: '📝 Lớp tiếng Nhật đang mở — học miễn phí', target: 'class' };
  return { text: '🌿 Thời gian tự do — đi dạo, nói chuyện, học tiếng Nhật…', target: null };
}
function targetPoint(id) {
  const b = BUILDINGS.find((x) => x.id === id);
  if (b) return entrance(b);
  const s = SPOTS.find((x) => x.id === id);
  return s ? { x: s.tx * TS + 8, y: s.ty * TS + 12 } : null;
}

export function placePlayer(id = 'dorm') {
  const S = G.S;
  const p = targetPoint(id) || targetPoint('dorm');
  S.pos = { x: p.x, y: p.y + 2 };
  S.dir = 'down';
}

// ---------- ngày / đêm ----------
function darkness(t) {
  const h = t / 60;
  const D = 0.72;
  if (h < 5) return D;
  if (h < 7) return D * (1 - (h - 5) / 2);
  if (h < 17) return 0;
  if (h < 19.5) return D * ((h - 17) / 2.5);
  return D;
}
let shadeCanvas = null;

// ---------- thời tiết ----------
const parts = [];
function updateParticles(dt, vw, vh, kind) {
  const want = kind === 'rain' ? 90 : kind === 'snow' ? 70 : kind === 'petal' || kind === 'leaf' ? 14 : 0;
  while (parts.length < want) parts.push({ x: Math.random() * vw, y: Math.random() * vh, s: Math.random() });
  if (parts.length > want) parts.length = want;
  for (const p of parts) {
    if (kind === 'rain') { p.x -= 40 * dt; p.y += 230 * dt; }
    else if (kind === 'snow') { p.x += Math.sin((p.y + p.s * 50) / 14) * 10 * dt; p.y += (14 + p.s * 14) * dt; }
    else { p.x += (18 + p.s * 10) * dt; p.y += (12 + p.s * 8) * dt; }
    if (p.y > vh) { p.y = -4; p.x = Math.random() * vw; }
    if (p.x < -4) p.x = vw; if (p.x > vw + 4) p.x = 0;
  }
}
function drawParticles(c, kind) {
  for (const p of parts) {
    if (kind === 'rain') rect(c, 'rgba(180,205,255,.55)', Math.round(p.x), Math.round(p.y), 1, 4);
    else if (kind === 'snow') rect(c, '#fff', Math.round(p.x), Math.round(p.y), p.s > 0.6 ? 2 : 1, p.s > 0.6 ? 2 : 1);
    else if (kind === 'petal') rect(c, '#f7b7cc', Math.round(p.x), Math.round(p.y), 2, 1);
    else rect(c, p.s > 0.5 ? '#d9662f' : '#e3a33a', Math.round(p.x), Math.round(p.y), 2, 2);
  }
}

// ---------- cảnh thị trấn ----------
let tAnim = 0, moving = false, lastTarget = null;

export const townScene = {
  target: null,
  update(dt) {
    const S = G.S;
    if (!S) return;
    tAnim += dt;
    const gm = dt * TIME_RATE;
    S.time += gm;
    tickNeeds(S, gm);
    // di chuyển
    const a = input.axis();
    moving = Math.abs(a.x) > 0.05 || Math.abs(a.y) > 0.05;
    if (moving) {
      const sp = 62 * (S.flags.bike ? 1.55 : 1) * (S.energy < 15 ? 0.7 : 1);
      S.dir = Math.abs(a.x) > Math.abs(a.y) ? (a.x < 0 ? 'left' : 'right') : (a.y < 0 ? 'up' : 'down');
      const nx = S.pos.x + a.x * sp * dt;
      if (!blocked(nx, S.pos.y)) S.pos.x = nx;
      const ny = S.pos.y + a.y * sp * dt;
      if (!blocked(S.pos.x, ny)) S.pos.y = ny;
    }
    // người đi đường & xe
    const night = S.time < 6 * 60 || S.time > 22 * 60;
    walkers.forEach((w, i) => {
      w.t += dt;
      if (night && i > 1) return;
      w.p += w.d * w.sp * dt;
      if (w.p < 4 || w.p > w.len - 4) { w.d *= -1; w.p = Math.max(4, Math.min(w.len - 4, w.p)); }
    });
    for (const car of cars) {
      if (car.wait > 0) { car.wait -= dt; continue; }
      car.p += car.L.d * car.sp * dt;
      if (car.p < -30 || car.p > car.len + 30) {
        car.p = car.L.d > 0 ? -28 : car.len + 28;
        car.wait = 1 + Math.random() * 4;
        car.col = pick(CAR_COLORS);
      }
    }
    // đối tượng tương tác gần nhất
    let best = null, bd = 17;
    const px = S.pos.x, py = S.pos.y;
    for (const b of BUILDINGS) {
      const e = entrance(b), d = Math.hypot(e.x - px, e.y - 4 - py);
      if (d < bd) { bd = d; best = { type: 'place', id: b.id, label: 'Vào ' + buildingName(b, S) }; }
    }
    for (const s of SPOTS) {
      const d = Math.hypot(s.tx * TS + 8 - px, s.ty * TS + 12 - py);
      if (d < bd) { bd = d; best = { type: 'place', id: s.id, label: s.name }; }
    }
    for (const n of npcPos(S)) {
      const d = Math.hypot(n.x - px, n.y - py);
      if (d < 18 && d < bd + 4) { bd = d; best = { type: 'npc', id: n.id, label: 'Nói chuyện: ' + n.name }; }
    }
    this.target = best;
    if ((best && best.label) !== lastTarget) {
      lastTarget = best && best.label;
      const btn = document.getElementById('btn-act');
      btn.hidden = !best;
      if (best) btn.textContent = best.type === 'npc' ? '💬' : '🚪';
    }
    const si = seasonIdx(S);
    const kind = S.weather === 'rain' ? 'rain' : S.weather === 'snow' ? 'snow' : si === 0 ? 'petal' : si === 2 ? 'leaf' : '';
    updateParticles(dt, this.vw || 320, this.vh || 240, kind);
  },

  draw(c, view) {
    const S = G.S;
    if (!S) return;
    const si = seasonIdx(S);
    ensureMap(si);
    const vw = view.w, vh = view.h;
    this.vw = vw; this.vh = vh;
    const mw = MW * TS, mh = MH * TS;
    let cx = Math.round(S.pos.x - vw / 2), cy = Math.round(S.pos.y - 10 - vh / 2);
    cx = mw <= vw ? Math.round((mw - vw) / 2) : Math.max(0, Math.min(mw - vw, cx));
    cy = mh <= vh ? Math.round((mh - vh) / 2) : Math.max(0, Math.min(mh - vh, cy));
    rect(c, '#1b2238', 0, 0, vw, vh);
    c.drawImage(mapCanvas, -cx, -cy);
    c.save();
    c.translate(-cx, -cy);
    // nước lấp lánh
    for (let i = 0; i < 14; i++) {
      const x = Math.floor(hash2(i, Math.floor(tAnim * 1.5), 3) * mw), y = 35 * TS + 3 + Math.floor(hash2(i, Math.floor(tAnim * 1.5), 8) * 44);
      if (x < 19 * TS || x > 23 * TS) rect(c, 'rgba(255,255,255,.55)', x, y, 3, 1);
    }
    // xe
    for (const car of cars) {
      if (car.wait > 0) continue;
      const x = car.L.h ? car.p : car.L.at * TS + 8, y = car.L.h ? car.L.at * TS + 8 : car.p;
      drawCar(c, x, y, car.L.h, car.col);
    }
    // người: sắp xếp theo y
    const ents = [];
    const night = S.time < 6 * 60 || S.time > 22 * 60;
    walkers.forEach((w, i) => {
      if (night && i > 1) return;
      const x = w.horiz ? w.p : w.lane * TS + 8, y = w.horiz ? w.lane * TS + 12 : w.p;
      const dir = w.horiz ? (w.d > 0 ? 'right' : 'left') : (w.d > 0 ? 'down' : 'up');
      ents.push({ y, f: () => drawPerson(c, x, y, w.look, dir, w.t, true) });
    });
    const npcs = npcPos(S);
    for (const n of npcs) {
      if (n.cat) ents.push({ y: n.y, f: () => drawCat(c, n.x, n.y, tAnim) });
      else {
        const dir = Math.hypot(S.pos.x - n.x, S.pos.y - n.y) < 40 ? (Math.abs(S.pos.x - n.x) > Math.abs(S.pos.y - n.y) ? (S.pos.x < n.x ? 'left' : 'right') : (S.pos.y < n.y ? 'up' : 'down')) : n.dir;
        ents.push({ y: n.y, f: () => drawPerson(c, n.x, n.y, n.look, dir, tAnim, false) });
      }
    }
    ents.push({ y: S.pos.y, f: () => drawPerson(c, S.pos.x, S.pos.y, { ...S.look, gender: S.gender }, S.dir, tAnim, moving) });
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.f());
    // dấu "!" trên đầu NPC chưa nói chuyện hôm nay
    for (const n of npcs) {
      if (n.cat || S.today[n.id]) continue;
      const bob = Math.round(Math.sin(tAnim * 4));
      rect(c, '#ffcf5a', n.x - 1, n.y - 27 + bob, 3, 5); rect(c, '#ffcf5a', n.x - 1, n.y - 21 + bob, 3, 2);
    }
    // bảng hiệu & tên nhà
    for (const b of BUILDINGS) {
      const X = b.x * TS, W = b.w * TS;
      if (X + W < cx - 20 || X > cx + vw + 20) continue;
      if (b.sign) text(c, b.id === 'work' ? JOBS[S.job].sign : b.jp, b.sign.x, b.sign.y, { size: 7, color: '#ffe7a3', align: 'center', shadow: false });
      pill(c, buildingName(b, S), X + W / 2, b.y * TS - 5, { size: 6 });
    }
    pill(c, 'Công viên', 12 * TS + 8, 28 * TS + 6, { size: 6, bg: 'rgba(30,70,40,.8)' });
    c.restore();

    // thời tiết
    if (S.weather === 'rain' || S.weather === 'cloudy') { c.fillStyle = 'rgba(50,60,85,.16)'; c.fillRect(0, 0, vw, vh); }
    const kind = S.weather === 'rain' ? 'rain' : S.weather === 'snow' ? 'snow' : si === 0 ? 'petal' : si === 2 ? 'leaf' : '';
    if (kind) drawParticles(c, kind);

    // hoàng hôn / ban đêm
    const h = S.time / 60;
    if (h > 16.3 && h < 19) { c.fillStyle = `rgba(255,130,60,${0.12 * Math.sin(((h - 16.3) / 2.7) * Math.PI)})`; c.fillRect(0, 0, vw, vh); }
    const dark = darkness(Math.min(S.time, MIDNIGHT + 60));
    if (dark > 0.01) {
      if (!shadeCanvas) shadeCanvas = document.createElement('canvas');
      if (shadeCanvas.width !== vw || shadeCanvas.height !== vh) { shadeCanvas.width = vw; shadeCanvas.height = vh; }
      const sc = shadeCanvas.getContext('2d');
      sc.globalCompositeOperation = 'source-over';
      sc.clearRect(0, 0, vw, vh);
      sc.fillStyle = `rgba(10,14,40,${dark})`;
      sc.fillRect(0, 0, vw, vh);
      sc.globalCompositeOperation = 'destination-out';
      const light = (x, y, r, a = 0.9) => {
        const X = x - cx, Y = y - cy;
        if (X < -r || Y < -r || X > vw + r || Y > vh + r) return;
        const g = sc.createRadialGradient(X, Y, 0, X, Y, r);
        g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        sc.fillStyle = g; sc.fillRect(X - r, Y - r, r * 2, r * 2);
      };
      for (const [lx, ly] of lamps) light(lx * TS + 14, ly * TS + 2, 34);
      for (const b of BUILDINGS) { const e = entrance(b); light(e.x, e.y - 14, 26, 0.7); }
      for (const car of cars) if (car.wait <= 0) light(car.L.h ? car.p + car.L.d * 14 : car.L.at * TS + 8, car.L.h ? car.L.at * TS + 8 : car.p + car.L.d * 14, 16, 0.6);
      light(S.pos.x, S.pos.y - 8, 26, 0.75);
      c.drawImage(shadeCanvas, 0, 0);
    }

    // mũi tên chỉ đường + gợi ý tương tác
    const ob = objective(S);
    const tp = ob.target && targetPoint(ob.target);
    const px = S.pos.x - cx, py = S.pos.y - cy;
    if (tp) {
      const dx = tp.x - S.pos.x, dy = tp.y - S.pos.y, d = Math.hypot(dx, dy);
      if (d > 40) {
        const ang = Math.atan2(dy, dx), r = 22 + Math.sin(tAnim * 5);
        const ax = px + Math.cos(ang) * r, ay = py - 8 + Math.sin(ang) * r;
        c.save(); c.translate(ax, ay); c.rotate(ang);
        c.fillStyle = '#ffcf5a'; c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(5, 0); c.lineTo(-3, -4); c.lineTo(-1, 0); c.lineTo(-3, 4); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
    }
    if (this.target && !G.busy) {
      const touch = document.body.classList.contains('touch');
      pill(c, (touch ? '' : '[E] ') + this.target.label, px, py - 30, { size: 6.5, bg: 'rgba(255,207,90,.95)', color: '#1b2238' });
    }
  },
};

export function initTown() {
  buildMap();
  spawnAmbient();
}
export function invalidateMap() { mapSeason = -1; }
export { FONT };
