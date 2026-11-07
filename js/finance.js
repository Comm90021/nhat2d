// Sổ cái tài chính: mọi thay đổi tiền đều được ghi thành giao dịch.
import { ASSETS } from './content/assets.js';
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
    bank: 0,
  };
}

// Bổ sung các trường của app ngân hàng (v3.2) cho save cũ
export function upgradeFin(F) {
  if (F.bank == null) F.bank = 0;
  if (!F.savings) F.savings = 0;
  if (!F.port) F.port = {};                 // {id: {units, cost, acct: 'nisa_t'|'nisa_g'|'taxable'}}
  if (!F.prices) F.prices = {};
  if (!F.nisa) F.nisa = { open: false, year: 0, usedT: 0, usedG: 0, life: 0 };
  if (!F.plan) F.plan = null;               // tích lũy hằng tháng {id, amount}
  if (F.credit == null) F.credit = 600;     // điểm tín dụng (300–850)
  if (!F.fx) F.fx = 170;                    // tỷ giá ₫/¥ biến động theo tháng
  if (!F.assets) F.assets = [];
  if (!F.licenses) F.licenses = [];
  if (!F.tickets) F.tickets = [];
  if (!F.card) F.card = null;               // {limit, balance}
  return F;
}
export const spendable = (S) => S.fin.cash + S.fin.bank;

// Hiệu ứng tài sản đang sở hữu: speed, sleep, study, mood, cook
export function assetEffect(S, key) {
  const vals = ((S.fin && S.fin.assets) || []).map((x) => { const A = ASSETS.find((y) => y.id === x.id); return A && A.effects ? A.effects[key] : null; }).filter((v) => v != null);
  if (key === 'speed') return Math.max(1, S.flags && S.flags.bike ? 1.5 : 1, ...vals);
  if (key === 'study') return Math.max(1, ...vals);
  return vals.reduce((a, b) => a + b, 0);
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
// S.money = tiền mặt + tài khoản (số tiền tiêu được). Chi tiêu lấy tiền mặt trước, thiếu thì trừ tài khoản
// (như thanh toán bằng thẻ / IC). Thu nhập lặt vặt vào tiền mặt; lương dùng deposit() để vào tài khoản.
export function attach(S) {
  upgradeFin(S.fin);
  if (Object.getOwnPropertyDescriptor(S, 'money') && Object.getOwnPropertyDescriptor(S, 'money').get) return S;
  Object.defineProperty(S, 'money', {
    configurable: true, enumerable: false,
    get() { return S.fin.cash + S.fin.bank; },
    set(v) {
      const F = S.fin, d = v - (F.cash + F.bank);
      if (d >= 0) F.cash += d;
      else { const fromCash = Math.min(Math.max(0, F.cash), -d); F.cash -= fromCash; F.bank += d + fromCash; if (F.bank < 0) { F.cash += F.bank; F.bank = 0; } }
      if (Math.abs(d) >= 1) record(S, d, ctx ? ctx.cat : 'other', ctx ? ctx.memo : '');
    },
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
// Tiền vào / ra thẳng tài khoản ngân hàng (lương, khấu trừ, trả góp, đầu tư)
export function deposit(S, amt, cat, memo) { S.fin.bank += amt; if (Math.abs(amt) >= 1) record(S, amt, cat, memo); }
export function bankPay(S, amt, cat, memo) {
  const F = S.fin;
  F.bank -= amt;
  if (F.bank < 0) { F.cash += F.bank; F.bank = 0; }
  if (Math.abs(amt) >= 1) record(S, -amt, cat, memo);
}
// Chuyển giữa ví và tài khoản (không tính là thu/chi)
export function moveCash(S, toBank, amt) {
  const F = S.fin;
  if (toBank) { const a = Math.min(amt, F.cash); F.cash -= a; F.bank += a; return a; }
  const a = Math.min(amt, F.bank); F.bank -= a; F.cash += a; return a;
}

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
