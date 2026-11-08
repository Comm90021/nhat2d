// Khu nhà ở: các tòa manshon / apato, hành lang có cửa từng phòng, mẫu nội thất căn hộ.
// Tất cả sinh bằng code từ thông số dưới đây (không vẽ tay từng phòng).

// floors × per = số phòng. kind: ai ở (jp đơn thân / jp gia đình / người Việt). type: loại căn hộ theo tầng.
// rent: tiền thuê/tháng · price: giá mua căn cũ (0 = không bán) · foreignOk: tỉ lệ chủ nhà chấp nhận người nước ngoài
// zero: phòng "0 cọc 0 lễ" (ゼロゼロ物件) · fresh: tòa mới xây, chưa có ai ở
export const BUILDINGS = {
  hikari: { map: 'jutaku', name: 'Hikari Heights', jp: '光ハイツ', floors: 3, per: 4, type: '1K', rent: 62000, price: 9800000, who: 'single', foreignOk: 0.55 },
  sakura: { map: 'jutaku', name: 'Sakura Mansion', jp: 'さくらマンション', floors: 3, per: 4, type: '1LDK', rent: 85000, price: 18500000, who: 'couple', foreignOk: 0.5 },
  residence: { map: 'jutaku', name: 'Hikari-dai Residence', jp: '光台レジデンス', floors: 3, per: 3, type: '3LDK', rent: 128000, price: 32000000, who: 'family', foreignOk: 0.4 },
  apt: { map: 'minato', name: 'Chung cư Minato', jp: 'みなとアパート', floors: 4, per: 4, type: '1K', rent: 42000, price: 0, who: 'vn', foreignOk: 1 },
  midori: { map: 'jutaku', name: 'Midori Court', jp: 'みどりコート', floors: 3, per: 3, type: '2LDK', rent: 98000, price: 23800000, who: 'new', foreignOk: 0.7, fresh: true },
  aoba: { map: 'jutaku', name: 'Aoba Apāto', jp: 'あおばアパート', floors: 2, per: 4, type: '1K', rent: 46000, price: 0, who: 'new', foreignOk: 1, zero: true, fresh: true },
};
export const TYPE_NAME = { '1K': '1K (1 phòng + bếp)', '1LDK': '1LDK (1 phòng ngủ + phòng khách bếp)', '2LDK': '2LDK (2 phòng ngủ + phòng khách bếp)', '3LDK': '3LDK (3 phòng ngủ + phòng khách bếp)' };

export const unitId = (bid, floor, i) => `${bid}-${floor}0${i}`;
export function unitsOf(bid) {
  const B = BUILDINGS[bid], out = [];
  for (let f = 1; f <= B.floors; f++) for (let i = 1; i <= B.per; i++) out.push({ uid: unitId(bid, f, i), bid, floor: f, room: `${f}0${i}`, type: B.type });
  return out;
}
export const allUnits = () => Object.keys(BUILDINGS).flatMap(unitsOf);
export const parseUnit = (uid) => { const [bid, room] = uid.split('-'); return { bid, room, floor: +room[0] }; };

// ---------- hành lang tòa nhà (lobby + các tầng) ----------
// Mỗi tầng: một hàng cửa + một hàng lối đi; giữa các tầng là tường có lỗ cầu thang (so le trái / phải).
export function corridorDef(bid) {
  const B = BUILDINGS[bid];
  const W = 4 + B.per * 4;
  const rows = ['#'.repeat(W)];
  for (let f = B.floors; f >= 1; f--) {
    let doorRow = '#F.';
    for (let i = 0; i < B.per; i++) doorRow += '.U..';
    rows.push((doorRow + '.'.repeat(W)).slice(0, W - 1) + '#');
    rows.push('#' + '.'.repeat(W - 2) + '#');
    if (f > 1) {
      const gap = (B.floors - f) % 2 === 0 ? W - 3 : 2;
      rows.push('#'.repeat(gap) + '.' + '#'.repeat(W - gap - 1));
    }
  }
  const door = Math.floor(W / 2);
  rows.push(('#MM' + '.'.repeat(door - 3) + 'D' + '.'.repeat(W)).slice(0, W - 2) + 'h#');
  rows.push('#'.repeat(W));
  return {
    name: `${B.name} (${B.jp})`, floor: 'tile', alt: 'wood', wall: '#ece6dc',
    rows,
    obj: {
      U: { kind: 'unitdoor', name: 'Cửa phòng', act: 'unit' },
      F: { kind: 'floorsign', name: 'Biển tầng', solid: true },
      M: { kind: 'mailbox', name: 'Hộp thư (郵便受け) — danh sách người ở', act: 'mailbox' },
      h: { kind: 'plant', name: 'Chậu cây', solid: true },
    },
    // gán số phòng cho từng cửa (thứ tự đọc: tầng trên xuống, trái sang phải)
    post(M) {
      const doors = M.objects.filter((o) => o.kind === 'unitdoor').sort((a, b) => a.y - b.y || a.x - b.x);
      let k = 0;
      for (let f = B.floors; f >= 1; f--) for (let i = 1; i <= B.per; i++) { const o = doors[k++]; if (o) { o.unit = unitId(bid, f, i); o.room = `${f}0${i}`; } }
      const signs = M.objects.filter((o) => o.kind === 'floorsign').sort((a, b) => a.y - b.y);
      signs.forEach((o, j) => { o.text = `${B.floors - j}F`; });
      M.bid = bid;
    },
  };
}

// ---------- nội thất căn hộ ----------
// X = đồ trang trí chọn theo tính cách (kệ sách / TV / cây cảnh / bàn máy tính)
const TEMPLATES = {
  '1K': [
    '############',
    '#BB..KKSR..#',
    '#BB........#',
    '#X....TT..X#',
    '#.....TT...#',
    '#hh..D.....#',
    '############',
  ],
  '1LDK': [
    '##############',
    '#BB.X#KKSR..X#',
    '#BB..#.......#',
    '#....#..TTT..#',
    '#............#',
    '#X........OO.#',
    '#hh..D.......#',
    '##############',
  ],
  '2LDK': [
    '################',
    '#BB..#bb..KKSR.#',
    '#BB..#bb.......#',
    '#X...#X...TTT..#',
    '##.#####.......#',
    '#..........OO.X#',
    '#hh....D.......#',
    '################',
  ],
  '3LDK': [
    '##################',
    '#BB..#bb..#KKSR..#',
    '#BB..#bb.X#......#',
    '#X...#....#.TTTT.#',
    '##.#####.##......#',
    '#................#',
    '#cc.X........OO.X#',
    '#hh.....D........#',
    '##################',
  ],
};
const DECOR = {
  books: { kind: 'bookshelf', name: 'Kệ sách' },
  tv: { kind: 'tv', name: 'Ti vi' },
  plant: { kind: 'plant', name: 'Chậu cây' },
  pc: { kind: 'pcdesk', name: 'Bàn máy tính' },
  desk: { kind: 'desk', name: 'Bàn học' },
};
// Đồ dùng trong nhà. mine = nhà của người chơi → đồ vật dùng được (ngủ, nấu, học, gọi về nhà…)
function homeObj(mine) {
  const a = (pick) => (mine ? { act: 'myhome', pick } : {});
  return {
    B: { kind: 'bed', name: mine ? 'Giường của bạn' : 'Giường', slot: { kind: 'sleep', at: 'on' }, solid: false, ...a(['Đi ngủ', 'Chợp mắt']) },
    b: { kind: 'bed', name: 'Giường', slot: { kind: 'sleep', at: 'on' }, solid: false, ...a(['Đi ngủ', 'Chợp mắt']) },
    c: { kind: 'futon', name: 'Đệm trẻ con', solid: false },
    K: { kind: 'stove', name: 'Bếp', slot: { kind: 'cook', at: 'below' }, ...a(['Nấu']) },
    S: { kind: 'sink', name: 'Bồn rửa', ...a(['Nấu']) },
    R: { kind: 'fridge', name: 'Tủ lạnh', ...a(['Nấu']) },
    T: { kind: 'lowtable', name: 'Bàn ăn', slot: { kind: 'rest', at: 'below' }, ...a(['Gọi video', 'Tự học', 'Ăn tối', 'Rủ', 'Mời']) },
    O: { kind: 'sofa', name: 'Sofa', slot: { kind: 'rest', at: 'below' }, ...a(['Xem', 'Nghỉ', 'Ôm']) },
    h: { kind: 'shoes', name: 'Kệ giày (genkan)', solid: false, ...a(['Nhà của tôi']) },
    t: { kind: 'lowtable', name: 'Bàn trà (phòng tatami)', slot: { kind: 'rest', at: 'below' }, ...a(['Gọi video', 'Tự học', 'Trà']) },
    a: { kind: 'bath', name: 'Bồn tắm (お風呂)', ...a(['Tắm']) },
  };
}
const decorate = (rows, obj, pickDecor) => {
  let n = 0;
  const letters = ['x', 'y', 'z', 'w', 'v'];
  return rows.map((r) => r.replace(/X/g, () => { const L = letters[n % letters.length]; obj[L] = DECOR[pickDecor(n)] || DECOR.plant; n++; return L; }));
};
// pickDecor(i) trả về key trong DECOR cho đồ trang trí thứ i (theo tính cách chủ nhà)
export function unitDef(uid, label, pickDecor, mine = false) {
  const { bid, room } = parseUnit(uid);
  const B = BUILDINGS[bid];
  const obj = homeObj(mine);
  const out = decorate(TEMPLATES[B.type], obj, pickDecor);
  return { name: `Phòng ${room} · ${B.name}${mine ? ' — nhà bạn' : label ? ' — nhà ' + label : ''}`, floor: 'wood', alt: 'tatami', wall: '#efe9de', rows: out, obj };
}

// ---------- nhà riêng (一戸建て) trên các lô đất ----------
export const HOUSE_TEMPLATES = {
  compact: [
    '##############',
    '#BB..#KKSR...#',
    '#BB..#.......#',
    '#X...#..TTT..#',
    '##.###.......#',
    '#a.........OO#',
    '#hh...D......#',
    '##############',
  ],
  family: [
    '##################',
    '#BB..#bb..#KKSR..#',
    '#BB..#bb.X#......#',
    '#X...#....#.TTTT.#',
    '##.#####.##......#',
    '#a...............#',
    '#cc.X........OO.X#',
    '#hh.....D........#',
    '##################',
  ],
  japanese: [
    '##################',
    '#BB..#,,,,,#KKSR.#',
    '#BB..#,,tt,#.....#',
    '#X...#,,tt,#.TTT.#',
    '##.###,,,,,#.....#',
    '#a....,,,,,......#',
    '#..............OO#',
    '#hh.....D.......X#',
    '##################',
  ],
};
export function houseDef(lot, plan, label, pickDecor, mine = false) {
  const obj = homeObj(mine);
  const out = decorate(HOUSE_TEMPLATES[plan] || HOUSE_TEMPLATES.family, obj, pickDecor);
  return { name: `${mine ? 'Nhà của bạn' : 'Nhà ' + (label || 'riêng')} (一戸建て)`, floor: 'wood', alt: 'tatami', wall: '#f1eadc', rows: out, obj };
}
