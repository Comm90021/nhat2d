// Dựng bản đồ nội thất từ lưới chữ.
import { TS } from '../pixel.js';
import { T } from './tiles.js';
import { makeMap } from './maps.js';
import { drawIndoorTile } from './tiles.js';
import { drawObjectStatic } from './objects.js';
import { INTERIORS } from '../content/interiors.js';

const FLOORS = { tatami: T.FTATAMI, wood: T.FWOOD, tile: T.FTILE, conc: T.FCONC, carpet: T.FCARPET, soil: T.FSOIL };
const COMMON = { '=': { kind: 'roller', name: 'Đầu băng chuyền' } };

export function buildInterior(key) {
  const def = INTERIORS[key];
  const w = Math.max(...def.rows.map((r) => r.length)), h = def.rows.length;
  const M = makeMap('int:' + key, w, h, T.VOID);
  M.outdoor = false;
  M.key = key;
  M.name = def.name;
  M.wall = def.wall;
  M.lines = new Set(def.lines || []);
  const main = FLOORS[def.floor] || T.FWOOD, alt = FLOORS[def.alt || def.floor] || main;
  const grid = def.rows.map((r) => r.padEnd(w, '#'));
  const cellObj = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = grid[y][x];
    if (ch === '#') M.set(x, y, T.WALL);
    else if (ch === 'D') { M.set(x, y, T.DOOR); M.door = { x, y }; }
    else if (ch === ' ') M.set(x, y, T.VOID);
    else if (ch === '.') M.set(x, y, main);
    else if (ch === ',') M.set(x, y, alt);
    else { M.set(x, y, (y > 0 && grid[y - 1][x] === ',') || (y < h - 1 && grid[y + 1][x] === ',') ? alt : main); cellObj.push([x, y, ch]); }
  }
  // gom các ô cùng chữ liền nhau thành một đồ vật
  const seen = new Set();
  M.objects = [];
  for (const [sx, sy, ch] of cellObj) {
    if (seen.has(sx + ',' + sy)) continue;
    const spec = def.obj[ch] || COMMON[ch] || { kind: 'crate', name: '?' };
    let minx = sx, maxx = sx, miny = sy, maxy = sy;
    const stack = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop();
      const k = x + ',' + y;
      if (seen.has(k) || x < 0 || y < 0 || x >= w || y >= h || grid[y][x] !== ch) continue;
      seen.add(k);
      minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    M.objects.push({ ch, ...spec, x: minx, y: miny, w: maxx - minx + 1, h: maxy - miny + 1, solid: spec.solid !== false });
  }
  // ô bị đồ vật chặn
  M.objAt = new Map();
  for (const o of M.objects) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) M.objAt.set(x + ',' + y, o);
  M.blockedTile = (x, y) => {
    const t = M.at(x, y);
    if (t === T.WALL || t === T.VOID) return true;
    const o = M.objAt.get(x + ',' + y);
    return !!(o && o.solid);
  };
  // chỗ đứng / ngồi cho NPC
  M.slots = {};
  for (const o of M.objects) {
    if (!o.slot) continue;
    const list = M.slots[o.slot.kind] || (M.slots[o.slot.kind] = []);
    if (o.slot.at === 'on') { for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) list.push({ x, y, o, sit: true }); continue; }
    const yy = o.slot.at === 'above' ? o.y - 1 : o.y + o.h;
    for (let x = o.x; x < o.x + o.w; x++) if (!M.blockedTile(x, yy) && M.at(x, yy) !== T.DOOR) list.push({ x, y: yy, o, face: o.slot.at === 'above' ? 'down' : 'up' });
  }
  M.entry = M.door ? { x: M.door.x * TS + 8, y: (M.door.y - 1) * TS + 12 } : { x: TS * 2, y: TS * 2 };
  return M;
}

export function renderInterior(M) {
  const cv = document.createElement('canvas');
  cv.width = M.w * TS; cv.height = M.h * TS;
  const c = cv.getContext('2d');
  for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) drawIndoorTile(c, M, x, y, M.at(x, y), x * TS, y * TS);
  for (const o of [...M.objects].sort((a, b) => a.y + a.h - (b.y + b.h))) drawObjectStatic(c, o);
  return cv;
}

export { INTERIORS };
