// Bản đồ ngoài trời dưới dạng dữ liệu: thị trấn Hikari + khu công nghiệp Minato.
import { TS, hash2, rect, disc } from '../pixel.js';
import { T, drawTile, drawBuilding, drawTree, drawLamp } from './tiles.js';

export function makeMap(id, w, h, fill = T.GRASS) {
  const tiles = new Uint8Array(w * h).fill(fill);
  const M = {
    id, w, h, tiles, outdoor: true,
    buildings: [], spots: [], lamps: [], zebra: {}, decorSolid: new Set(), aiSpots: {},
    at: (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? T.VOID : tiles[y * w + x]),
    set: (x, y, t) => { if (x >= 0 && y >= 0 && x < w && y < h) tiles[y * w + x] = t; },
  };
  return M;
}
export const entrance = (b) => ({ x: b.door * TS + 8, y: (b.y + b.h) * TS + 10, tx: b.door, ty: b.y + b.h });

function placeBuildings(M) {
  for (const b of M.buildings) {
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) M.set(x, y, T.BLD);
    for (let y = b.y + b.h; y < M.h && M.at(b.door, y) === T.GRASS; y++) M.set(b.door, y, T.PATH);
  }
}
function plantTrees(M, keep, density, parkFn) {
  for (let y = 1; y < M.h; y++) for (let x = 0; x < M.w; x++) {
    if (M.at(x, y) !== T.GRASS || keep.has(x + ',' + y)) continue;
    const h = hash2(x, y, 7 + M.id.length);
    const park = parkFn(x, y);
    if (park ? h < 0.17 : h < density) M.set(x, y, T.TREE);
    else if (h > 0.94) M.set(x, y, T.FLOWER);
  }
}
const reserveFn = (keep) => (x, y, r = 1) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) keep.add((x + dx) + ',' + (y + dy)); };

// ======================= THỊ TRẤN HIKARI =======================
export function buildTown() {
  const M = makeMap('town', 56, 38);
  M.name = 'Thị trấn Hikari';
  M.buildings = [
    { id: 'dorm', name: 'Ký túc xá', jp: '寮', x: 2, y: 5, w: 7, h: 6, door: 5, wall: '#e6d8bf', roof: '#7a5240', style: 'dorm' },
    { id: 'konbini', name: 'Konbini', jp: 'コンビニ', x: 11, y: 7, w: 6, h: 4, door: 13, wall: '#f4f3ee', roof: '#3d3a52', style: 'konbini' },
    { id: 'work', name: 'Chỗ làm', jp: '会社', x: 24, y: 4, w: 10, h: 7, door: 28, wall: '#cdd5dc', roof: '#46617a', style: 'factory' },
    { id: 'clinic', name: 'Phòng khám', jp: 'クリニック', x: 36, y: 7, w: 6, h: 4, door: 38, wall: '#f0f5f6', roof: '#4b8a86', style: 'clinic' },
    { id: 'station', name: 'Ga Hikari', jp: 'ひかり駅', x: 46, y: 5, w: 7, h: 6, door: 49, wall: '#eef0f2', roof: '#5a6470', style: 'station' },
    { id: 'super', name: 'Siêu thị', jp: 'スーパー', x: 1, y: 18, w: 7, h: 5, door: 4, wall: '#f5eedf', roof: '#b5533c', style: 'shop' },
    { id: 'class', name: 'Lớp tiếng Nhật', jp: '日本語教室', x: 10, y: 18, w: 7, h: 5, door: 13, wall: '#ece3cf', roof: '#5d7a4c', style: 'hall' },
    { id: 'remit', name: 'Chuyển tiền', jp: '送金', x: 24, y: 19, w: 6, h: 4, door: 26, wall: '#e6edf5', roof: '#2f5d8a', style: 'shop' },
    { id: 'shrine', name: 'Đền Hikari', jp: '神社', x: 34, y: 17, w: 5, h: 4, door: 36, wall: '#b8382b', roof: '#3a2f2a', style: 'shrine' },
    { id: 'ramen', name: 'Quán ramen Taishō', jp: 'ラーメン', x: 45, y: 18, w: 6, h: 5, door: 47, wall: '#efe2c8', roof: '#4a2a22', style: 'ramen' },
    { id: 'center', name: 'Trung tâm giao lưu', jp: '国際交流', x: 34, y: 28, w: 7, h: 4, door: 37, wall: '#eef3f0', roof: '#7a5ea8', style: 'hall' },
    { id: 'care', name: 'Viện dưỡng lão Hinata', jp: '介護施設', x: 44, y: 28, w: 8, h: 4, door: 47, wall: '#fbf4ea', roof: '#c27b4a', style: 'care' },
  ];
  M.spots = [
    { id: 'park', tx: 12, ty: 30, name: 'Công viên', interact: true },
    { id: 'river', tx: 30, ty: 34, name: 'Bờ sông', interact: true },
  ];
  // chỗ đứng ngoài trời cho NPC
  M.aiSpots = {
    dorm_front: [[9, 11], [7, 11]], work_corner: [[32, 11], [33, 11]], konbini_front: [[17, 11], [16, 11]],
    park: [[11, 30], [14, 30], [13, 32], [15, 29], [10, 29], [16, 32]], river: [[28, 34], [31, 34], [33, 34]],
    station_front: [[50, 12], [47, 12]], shrine: [[35, 22], [37, 22], [36, 22]],
  };
  const W = M.w;
  for (let x = 0; x < 54; x++) {
    M.set(x, 12, T.WALK); M.set(x, 13, T.ROAD); M.set(x, 14, T.ROAD); M.set(x, 15, T.WALK);
    M.set(x, 24, T.WALK); M.set(x, 25, T.ROAD); M.set(x, 26, T.ROAD); M.set(x, 27, T.WALK);
  }
  for (let y = 0; y <= 34; y++) {
    M.set(19, y, M.at(19, y) === T.ROAD ? T.ROAD : T.WALK);
    M.set(22, y, M.at(22, y) === T.ROAD ? T.ROAD : T.WALK);
    M.set(20, y, T.ROAD); M.set(21, y, T.ROAD);
  }
  for (let y = 35; y < M.h; y++) for (let x = 0; x < W; x++) M.set(x, y, x >= 19 && x <= 22 ? T.BRIDGE : T.WATER);
  for (let y = 0; y < M.h; y++) { M.set(54, y, T.RAIL); M.set(55, y, T.RAIL); }
  for (let y = 3; y <= 11; y++) M.set(53, y, T.PLATFORM);
  for (let y = 30; y <= 32; y++) for (let x = 3; x <= 8; x++) if (!((y === 30 || y === 32) && (x === 3 || x === 8))) M.set(x, y, T.WATER);
  for (let y = 21; y <= 23; y++) for (let x = 33; x <= 39; x++) M.set(x, y, T.PLAZA);
  for (let x = 10; x <= 18; x++) M.set(x, 31, T.PATH);
  for (let x = 23; x <= 47; x++) M.set(x, 33, T.PATH);
  M.set(30, 34, T.PATH);
  for (const x of [20, 21]) for (const y of [12, 15, 24, 27]) M.zebra[x + ',' + y] = 'v';
  for (const x of [19, 22]) for (const y of [13, 14, 25, 26]) M.zebra[x + ',' + y] = 'h';
  placeBuildings(M);
  const keep = new Set(), reserve = reserveFn(keep);
  for (const b of M.buildings) reserve(b.door, b.y + b.h);
  for (const s of M.spots) reserve(s.tx, s.ty);
  for (const list of Object.values(M.aiSpots)) for (const [x, y] of list) reserve(x, y, 0);
  [[9, 11], [17, 11], [14, 30], [9, 29], [12, 31], [32, 11]].forEach(([x, y]) => reserve(x, y));
  for (let x = 31; x <= 47; x++) reserve(x, 33, 0);
  for (let x = 0; x < 54; x += 2) if (M.at(x, 0) === T.GRASS) M.set(x, 0, T.TREE);
  plantTrees(M, keep, 0.035, (x, y) => y >= 28 && y <= 34 && x < 42);
  for (let y = 16; y <= 21; y++) { if (M.at(32, y) === T.GRASS) M.set(32, y, T.TREE); if (M.at(40, y) === T.GRASS) M.set(40, y, T.TREE); }
  for (let x = 32; x <= 40; x++) if (M.at(x, 16) === T.GRASS) M.set(x, 16, T.TREE);
  ['17,10', '9,10', '35,23', '37,23'].forEach((k) => M.decorSolid.add(k));
  for (const x of [3, 10, 16, 26, 33, 40, 45, 51]) { M.lamps.push([x, 12]); M.lamps.push([x, 24]); }
  M.lamps.push([16, 30], [25, 32], [11, 27], [31, 27], [44, 33]);
  M.parkTree = (x, y) => y >= 28 && x < 42;
  M.walkLanes = { h: [[12, 0, 53], [15, 0, 53], [24, 0, 53], [27, 0, 53]], v: [[19, 0, 34], [22, 0, 34]] };
  M.carLanes = [{ h: true, at: 13, d: -1, len: 54 }, { h: true, at: 14, d: 1, len: 54 }, { h: true, at: 25, d: -1, len: 54 }, { h: true, at: 26, d: 1, len: 54 }, { h: false, at: 20, d: 1, len: 38 }, { h: false, at: 21, d: -1, len: 38 }];
  M.rails = { x: 54, dir: 1 };
  // đi bộ hết đường phía tây → sang khu dân cư Hikari-dai
  M.edges = [{ side: 'w', to: 'jutaku', y0: 12, y1: 15, name: '🏘️ Khu dân cư Hikari-dai' }];
  M.decor = (c, si) => {
    let X = 9 * TS, Y = 10 * TS;
    rect(c, '#3f6b55', X + 1, Y + 3, 14, 12); rect(c, '#2e5442', X + 1, Y + 3, 14, 2);
    rect(c, '#e8e8e8', X + 3, Y + 7, 5, 6); rect(c, '#9cc3e6', X + 8, Y + 8, 5, 5);
    X = 17 * TS; Y = 10 * TS;
    rect(c, '#c0392b', X + 2, Y, 12, 15); rect(c, '#ecf0f1', X + 4, Y + 2, 8, 6);
    for (let i = 0; i < 4; i++) rect(c, ['#3498db', '#e67e22', '#2ecc71', '#f1c40f'][i], X + 4 + i * 2, Y + 3, 1, 4);
    rect(c, '#2c3e50', X + 5, Y + 10, 6, 2);
    X = 12 * TS; Y = 30 * TS;
    rect(c, '#8a5a35', X + 1, Y + 6, 14, 3); rect(c, '#6b4428', X + 1, Y + 3, 14, 2);
    rect(c, '#555', X + 2, Y + 9, 1, 3); rect(c, '#555', X + 13, Y + 9, 1, 3);
    if (si !== 3) for (const [lx, ly] of [[4, 31], [6, 30], [7, 31]]) disc(c, '#4f9a4a', lx * TS + 8, ly * TS + 8, 3);
    X = 35 * TS; Y = 23 * TS;
    rect(c, '#c8352a', X + 6, Y - 10, 3, 24); rect(c, '#c8352a', X + 39, Y - 10, 3, 24);
    rect(c, '#2b2220', X, Y - 14, 48, 3); rect(c, '#c8352a', X + 2, Y - 11, 44, 2); rect(c, '#c8352a', X + 4, Y - 6, 40, 2);
    // mái che sân ga
    rect(c, '#5a6470', 53 * TS - 2, 3 * TS - 6, TS + 4, 4);
    for (const [lx, ly] of M.lamps) drawLamp(c, lx, ly);
  };
  return M;
}

// ======================= KHU CÔNG NGHIỆP MINATO =======================
export function buildIndustrial() {
  const M = makeMap('minato', 50, 36);
  M.name = 'Khu công nghiệp Minato';
  M.buildings = [
    { id: 'station2', name: 'Ga Minato', jp: 'みなと駅', x: 3, y: 3, w: 6, h: 6, door: 5, wall: '#eef0f2', roof: '#5a6470', style: 'station' },
    { id: 'bento', name: 'Nhà máy cơm hộp Sakura', jp: '弁当工場', x: 12, y: 2, w: 10, h: 7, door: 16, wall: '#f1ece2', roof: '#b35d4f', style: 'factory' },
    { id: 'it', name: 'Văn phòng Kaizen IT', jp: 'IT企業', x: 28, y: 1, w: 7, h: 8, door: 31, wall: '#cfd8e2', roof: '#33465c', style: 'office' },
    { id: 'electric', name: 'Công ty điện Tōhoku Denki', jp: '電気工事', x: 37, y: 2, w: 11, h: 7, door: 41, wall: '#dfe4d6', roof: '#3d5a3a', style: 'plant' },
    { id: 'parts', name: 'Nhà máy linh kiện Minato Parts', jp: '部品工場', x: 3, y: 14, w: 13, h: 9, door: 9, wall: '#d2d6da', roof: '#4c5866', style: 'plant' },
    { id: 'teishoku', name: 'Quán cơm Ōmori', jp: '定食屋', x: 17, y: 18, w: 5, h: 5, door: 19, wall: '#efe2c8', roof: '#4a2a22', style: 'ramen' },
    { id: 'logistics', name: 'Kho vận Hayabusa', jp: '物流倉庫', x: 28, y: 14, w: 13, h: 9, door: 34, wall: '#c9cdd1', roof: '#2f3e4f', style: 'warehouse' },
    { id: 'site', name: 'Công trường Minato', jp: '建設現場', x: 3, y: 28, w: 14, h: 6, door: 9, wall: '#c9c4b5', roof: '#555', style: 'site' },
    { id: 'apt', name: 'Chung cư Minato', jp: 'アパート', x: 28, y: 28, w: 7, h: 6, door: 31, wall: '#e4ddd0', roof: '#6b5a4a', style: 'apt' },
  ];
  M.spots = [{ id: 'mpark', tx: 43, ty: 31, name: 'Công viên nhỏ', interact: false }];
  M.aiSpots = { mpark: [[42, 31], [44, 31], [43, 32]], station2_front: [[7, 10], [4, 10]], parts_corner: [[17, 23], [16, 23]] };
  for (let y = 0; y < M.h; y++) { M.set(0, y, T.RAIL); M.set(1, y, T.RAIL); }
  for (let y = 2; y <= 9; y++) M.set(2, y, T.PLATFORM);
  for (let x = 3; x < M.w; x++) {
    M.set(x, 9, T.WALK); M.set(x, 10, T.ROAD); M.set(x, 11, T.ROAD); M.set(x, 12, T.WALK);
    M.set(x, 23, T.WALK); M.set(x, 24, T.ROAD); M.set(x, 25, T.ROAD); M.set(x, 26, T.WALK);
  }
  for (let y = 0; y < M.h; y++) {
    M.set(23, y, M.at(23, y) === T.ROAD ? T.ROAD : T.WALK);
    M.set(26, y, M.at(26, y) === T.ROAD ? T.ROAD : T.WALK);
    M.set(24, y, T.ROAD); M.set(25, y, T.ROAD);
  }
  for (const x of [24, 25]) for (const y of [9, 12, 23, 26]) M.zebra[x + ',' + y] = 'v';
  for (const x of [23, 26]) for (const y of [10, 11, 24, 25]) M.zebra[x + ',' + y] = 'h';
  for (let y = 15; y <= 21; y++) for (let x = 42; x <= 48; x++) M.set(x, y, T.PARKING);
  for (let x = 10; x <= 22; x++) M.set(x, 34, T.PATH);
  for (let x = 27; x <= 31; x++) M.set(x, 34, T.PATH);
  placeBuildings(M);
  const keep = new Set(), reserve = reserveFn(keep);
  for (const b of M.buildings) reserve(b.door, b.y + b.h);
  for (const list of Object.values(M.aiSpots)) for (const [x, y] of list) reserve(x, y, 0);
  for (let x = 10; x <= 22; x++) reserve(x, 34, 0);
  plantTrees(M, keep, 0.03, (x, y) => x >= 38 && y >= 28);
  for (const x of [6, 13, 20, 30, 37, 44]) { M.lamps.push([x, 9]); M.lamps.push([x, 23]); }
  M.parkTree = (x, y) => x >= 38 && y >= 28;
  M.walkLanes = { h: [[9, 3, 49], [12, 3, 49], [23, 3, 49], [26, 3, 49]], v: [[23, 0, 35], [26, 0, 35]] };
  M.carLanes = [{ h: true, at: 10, d: -1, len: 50 }, { h: true, at: 11, d: 1, len: 50 }, { h: true, at: 24, d: -1, len: 50 }, { h: true, at: 25, d: 1, len: 50 }, { h: false, at: 24, d: 1, len: 36 }, { h: false, at: 25, d: -1, len: 36 }];
  M.rails = { x: 0, dir: -1 };
  M.decor = (c) => {
    rect(c, '#5a6470', 2 * TS - 2, 2 * TS - 6, TS + 4, 4);
    // xe tải đỗ ở bãi
    for (const [x, y, col] of [[43, 16, '#e8e8e8'], [45, 16, '#2f6db5'], [47, 19, '#e8e8e8']]) {
      rect(c, col, x * TS + 1, y * TS, 14, 26); rect(c, '#334', x * TS + 3, y * TS + 2, 10, 6);
    }
    rect(c, '#8a5a35', 43 * TS + 1, 31 * TS + 6, 14, 3); rect(c, '#6b4428', 43 * TS + 1, 31 * TS + 3, 14, 2);
    for (const [lx, ly] of M.lamps) drawLamp(c, lx, ly);
  };
  return M;
}

// ======================= KHU DÂN CƯ HIKARI-DAI =======================
// Các tòa manshon nơi người Nhật trong thị trấn sống; nối với thị trấn bằng đường bộ ở mép đông.
export function buildResidential() {
  const M = makeMap('jutaku', 46, 30);
  M.name = 'Khu dân cư Hikari-dai';
  M.buildings = [
    { id: 'hikari', name: 'Hikari Heights', jp: '光ハイツ', x: 2, y: 2, w: 8, h: 9, door: 6, wall: '#efe7da', roof: '#7d6a58', style: 'apt' },
    { id: 'sakura', name: 'Sakura Mansion', jp: 'さくらマンション', x: 12, y: 2, w: 8, h: 9, door: 16, wall: '#f3e3e6', roof: '#9c5b6b', style: 'apt' },
    { id: 'residence', name: 'Hikari-dai Residence', jp: '光台レジデンス', x: 26, y: 1, w: 10, h: 10, door: 31, wall: '#e3e8ee', roof: '#45586e', style: 'apt' },
    { id: 'fudosan', name: 'Bất động sản Hikari', jp: '不動産', x: 38, y: 6, w: 6, h: 5, door: 40, wall: '#f4f1e6', roof: '#3f7a5a', style: 'shop' },
  ];
  M.spots = [{ id: 'jpark', tx: 10, ty: 22, name: 'Công viên Hikari-dai', interact: true }];
  M.aiSpots = { jpark: [[9, 22], [11, 22], [10, 23], [12, 21], [8, 21]] };
  for (let x = 0; x < M.w; x++) { M.set(x, 12, T.WALK); M.set(x, 13, T.ROAD); M.set(x, 14, T.ROAD); M.set(x, 15, T.WALK); }
  for (let y = 0; y < M.h; y++) {
    M.set(21, y, M.at(21, y) === T.ROAD ? T.ROAD : T.WALK);
    M.set(24, y, M.at(24, y) === T.ROAD ? T.ROAD : T.WALK);
    M.set(22, y, T.ROAD); M.set(23, y, T.ROAD);
  }
  for (const x of [22, 23]) for (const y of [12, 15]) M.zebra[x + ',' + y] = 'v';
  for (const x of [21, 24]) for (const y of [13, 14]) M.zebra[x + ',' + y] = 'h';
  // công viên + lối đi; khu đất trống phía đông nam (sẽ bán lô xây nhà)
  for (let x = 4; x <= 17; x++) M.set(x, 24, T.PATH);
  for (let y = 16; y <= 24; y++) M.set(10, y, T.PATH);
  for (let y = 19; y <= 22; y++) for (let x = 14; x <= 17; x++) M.set(x, y, T.WATER);
  for (let y = 18; y <= 27; y++) for (let x = 27; x <= 43; x++) if ((x - 27) % 6 === 0 || (y - 18) % 5 === 0) M.set(x, y, T.PATH);
  placeBuildings(M);
  const keep = new Set(), reserve = reserveFn(keep);
  for (const b of M.buildings) reserve(b.door, b.y + b.h);
  for (const s of M.spots) reserve(s.tx, s.ty);
  for (const list of Object.values(M.aiSpots)) for (const [x, y] of list) reserve(x, y, 0);
  for (let y = 17; y <= 28; y++) for (let x = 26; x <= 44; x++) keep.add(x + ',' + y);
  plantTrees(M, keep, 0.03, (x, y) => y >= 17 && x < 20);
  for (const x of [4, 12, 19, 28, 36, 43]) { M.lamps.push([x, 12]); M.lamps.push([x, 15]); }
  M.lamps.push([10, 20]);
  M.parkTree = (x, y) => y >= 17 && x < 20;
  M.walkLanes = { h: [[12, 0, 45], [15, 0, 45]], v: [[21, 0, 29], [24, 0, 29]] };
  M.carLanes = [{ h: true, at: 13, d: -1, len: 46 }, { h: true, at: 14, d: 1, len: 46 }, { h: false, at: 22, d: 1, len: 30 }, { h: false, at: 23, d: -1, len: 30 }];
  M.edges = [{ side: 'e', to: 'town', y0: 12, y1: 15, name: '🏘️ Về thị trấn Hikari' }];
  M.decor = (c, si) => {
    // ghế đá công viên, biển khu đất bán
    rect(c, '#8a5a35', 8 * TS + 1, 20 * TS + 6, 14, 3); rect(c, '#6b4428', 8 * TS + 1, 20 * TS + 3, 14, 2);
    rect(c, '#f4f1e6', 34 * TS, 17 * TS + 4, 18, 10); rect(c, '#c0392b', 34 * TS + 2, 17 * TS + 6, 14, 2); rect(c, '#555', 34 * TS + 8, 17 * TS + 14, 2, 4);
    for (const [lx, ly] of M.lamps) drawLamp(c, lx, ly);
  };
  return M;
}

// ---------- vẽ bản đồ tĩnh (mỗi mùa một lần) ----------
export function renderStatic(M, si) {
  const cv = document.createElement('canvas');
  cv.width = M.w * TS; cv.height = M.h * TS;
  const c = cv.getContext('2d');
  for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) drawTile(c, M, x, y, si);
  for (const b of M.buildings) drawBuilding(c, b, si);
  if (M.decor) M.decor(c, si);
  if (M.outdoor) for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) if (M.at(x, y) === T.TREE) drawTree(c, x, y, si, M.parkTree && M.parkTree(x, y));
  return cv;
}
