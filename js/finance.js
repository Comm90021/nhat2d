// Sổ cái tài chính: mọi thay đổi tiền đều được ghi thành giao dịch.
// S.money và S.debt là "thuộc tính ảo" (getter/setter) trỏ vào S.fin để code cũ vẫn chạy.

export const CAT = {
  salary: '💼 Lương', tax: '🏛️ Thuế', insurance: '🩺 Bảo hiểm', rent: '🏠 Tiền nhà', utility: '💡 Điện nước',
  living: '🧺 Sinh hoạt', food: '🍱 Ăn uống', health: '💊 Y tế', remit: '💸 Gửi về nhà', study: '📚 Học tập',
  social: '🍻 Giao lưu', gift: '🎁 Quà', date: '💑 Hẹn hò', family: '👨‍👩‍👧 Gia đình', child: '👶 Con cái',
  travel: '✈️ Đi lại', loan: '🏦 Vay / trả nợ', scam: '⚠️ Bị lừa', shop: '🛒 Mua sắm', wedding: '💍 Cưới hỏi',
  event: '📅 Sự kiện', other: '• Khác',
};

let ctx = null;
// Gắn nhóm cho các thay đổi tiền xảy ra bên trong fn (đồng bộ hoặc async)
export async function withCat(cat, memo, fn) {
  const prev = ctx;
  ctx = { cat, memo };
  try { return await fn(); } finally { ctx = prev; }
}
export function setCat(cat, memo = '') { ctx = { cat, memo }; }
export function clearCat() { ctx = null; }

export function newFin(cash, homeDebtVnd) {
  return {
    cash,
    tx: [],
    months: {},
    debts: [{ id: 'home', kind: 'home', lender: 'Khoản vay đi Nhật (gia đình / ngân hàng ở quê)', currency: 'VND', principal: homeDebtVnd, balance: homeDebtVnd, rate: 0, status: 'active' }],
    receivables: [],
  };
}

function record(S, amt, cat, memo) {
  const F = S.fin;
  F.tx.unshift({ d: S.day, a: Math.round(amt), c: cat, m: memo || '' });
  if (F.tx.length > 400) F.tx.length = 400;
  const key = Math.ceil(S.day / 7);          // mỗi tuần = 1 tháng
  const m = F.months[key] || (F.months[key] = {});
  m[cat] = (m[cat] || 0) + Math.round(amt);
}

// Gắn S.money / S.debt ảo. Gọi sau khi tạo mới hoặc tải save.
export function attach(S) {
  if (Object.getOwnPropertyDescriptor(S, 'money') && Object.getOwnPropertyDescriptor(S, 'money').get) return S;
  Object.defineProperty(S, 'money', {
    configurable: true, enumerable: false,
    get() { return S.fin.cash; },
    set(v) { const d = v - S.fin.cash; S.fin.cash = v; if (Math.abs(d) >= 1) record(S, d, ctx ? ctx.cat : 'other', ctx ? ctx.memo : ''); },
  });
  Object.defineProperty(S, 'debt', {
    configurable: true, enumerable: false,
    get() { const h = S.fin.debts.find((x) => x.id === 'home'); return h ? h.balance : 0; },
    set(v) { const h = S.fin.debts.find((x) => x.id === 'home'); if (h) { h.balance = v; if (v <= 0) h.status = 'paid'; } },
  });
  return S;
}

export function pay(S, amt, cat, memo) { const p = ctx; ctx = { cat, memo }; S.money -= amt; ctx = p; }
export function earn(S, amt, cat, memo) { const p = ctx; ctx = { cat, memo }; S.money += amt; ctx = p; }

// ---------- nợ ----------
export function addDebt(S, d) { S.fin.debts.push({ status: 'active', ...d }); }
export const debt = (S, id) => S.fin.debts.find((x) => x.id === id && x.status === 'active');
export function closeDebt(S, id) { const d = S.fin.debts.find((x) => x.id === id); if (d) d.status = 'paid'; }

// Báo cáo tháng gần nhất
export function monthReport(S, key = Math.ceil(S.day / 7)) {
  const m = S.fin.months[key] || {};
  let inc = 0, out = 0;
  for (const v of Object.values(m)) { if (v > 0) inc += v; else out += v; }
  return { m, inc, out };
}
