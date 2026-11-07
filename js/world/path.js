// Tìm đường A* trên lưới ô (4 hướng). blocked(x, y) → true nếu không đi được.
export function findPath(w, h, blocked, sx, sy, tx, ty, maxNodes = 4000) {
  if (sx === tx && sy === ty) return [];
  const key = (x, y) => y * w + x;
  const open = [[sx, sy]];
  const g = new Map([[key(sx, sy), 0]]);
  const f = new Map([[key(sx, sy), Math.abs(tx - sx) + Math.abs(ty - sy)]]);
  const from = new Map();
  const closed = new Set();
  let n = 0;
  while (open.length && n++ < maxNodes) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (f.get(key(...open[i])) < f.get(key(...open[bi]))) bi = i;
    const [x, y] = open.splice(bi, 1)[0];
    const k = key(x, y);
    if (x === tx && y === ty) {
      const path = [];
      let cur = k;
      while (cur !== key(sx, sy)) { path.push([cur % w, Math.floor(cur / w)]); cur = from.get(cur); }
      return path.reverse();
    }
    closed.add(k);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;
      if (blocked(nx, ny) && !(nx === tx && ny === ty)) continue;
      const ng = g.get(k) + 1;
      if (!g.has(nk) || ng < g.get(nk)) {
        g.set(nk, ng); f.set(nk, ng + Math.abs(tx - nx) + Math.abs(ty - ny)); from.set(nk, k);
        if (!open.some(([ox, oy]) => ox === nx && oy === ny)) open.push([nx, ny]);
      }
    }
  }
  return null;
}
