// App ngân hàng & kinh tế (v3.2): tài khoản, tiết kiệm, chuyển tiền (tỷ giá biến động), vay, thẻ,
// quỹ / cổ phiếu, NISA, vé số, tài sản. Mọi thay đổi số dư đều đi qua finance.js nên có lịch sử giao dịch.
import { G, yen, vnd, year, doy, addLog, applyFx, clamp, RATE } from './state.js';
import { modal, chips, toast, esc } from './ui.js';
import { CAT, pay, earn, deposit, bankPay, moveCash, addDebt, monthReport, spendable, assetEffect } from './finance.js';
import { FUNDS, STOCKS } from './content/market.js';
import { LOTTERIES } from './content/lottery.js';
import { ASSETS, LICENSES, FIN_TEXT } from './content/assets.js';
import { rnd, gauss } from './ai/rules.js';
import { atLeast } from './social.js';
import { sfx } from './audio.js';

const TAX = 0.20315;                       // thuế lãi đầu tư ở Nhật
const NISA_T = 1200000, NISA_G = 2400000, NISA_LIFE = 18000000;
const SEC = [...FUNDS, ...STOCKS];
const secOf = (id) => SEC.find((s) => s.id === id);
export const priceOf = (S, id) => S.fin.prices[id] || secOf(id).price;
const calYear = (S) => year(S) + (doy(S) >= 64 ? 1 : 0);   // NISA tính theo năm dương lịch (bắt đầu tháng 1 = doy 64)

// ---------- giá trị tài sản ----------
export function portfolioValue(S) {
  let v = 0;
  for (const [id, h] of Object.entries(S.fin.port)) v += h.units * priceOf(S, id);
  return Math.round(v);
}
export function netWorth(S) {
  const F = S.fin;
  const jpyDebt = F.debts.filter((d) => d.status === 'active' && d.currency !== 'VND').reduce((a, d) => a + d.balance, 0);
  const assets = F.assets.reduce((a, x) => { const A = ASSETS.find((y) => y.id === x.id); return a + (A ? A.price * (A.resale || 0) : 0); }, 0);
  const home = S.home && S.home.own ? S.home.value || 0 : 0;
  return Math.round(F.cash + F.bank + F.savings + portfolioValue(S) + assets + home - jpyDebt - (F.card ? F.card.balance : 0) - Math.max(0, S.debt) / F.fx);
}
export { assetEffect };

// ---------- cuối tháng ----------
export function bankMonthEnd(S, ctx) {
  const F = S.fin, seed = S.world ? S.world.seed : 1, k = S.day;
  const msgs = [];
  // tỷ giá
  F.fx = Math.round(clamp(F.fx * Math.exp(0.02 * gauss(seed, k, 'fx')), 140, 210) * 10) / 10;
  // thị trường: chuyển động ngẫu nhiên hình học + thỉnh thoảng có cú sốc chung
  const shock = rnd(seed, k, 'crash') < 0.025 ? -0.14 : rnd(seed, k, 'boom') < 0.03 ? 0.07 : 0;
  if (shock < 0) msgs.push('📉 Thị trường chứng khoán lao dốc tháng này (khủng hoảng ngắn hạn).');
  for (const s of SEC) {
    const p = priceOf(S, s.id), mu = s.mu - (s.fee || 0), sg = s.sigma;
    const beta = s.kind === 'fund' && s.sigma < 0.05 ? 0.1 : 1;
    F.prices[s.id] = Math.max(1, Math.round(p * Math.exp((mu - sg * sg / 2) / 12 + sg * Math.sqrt(1 / 12) * gauss(seed, k, s.id) + shock * beta) * 100) / 100);
  }
  // cổ tức
  let div = 0;
  for (const [id, h] of Object.entries(F.port)) {
    const s = secOf(id);
    if (!s || !s.dividend) continue;
    const g = h.units * priceOf(S, id) * s.dividend / 12;
    div += h.acct === 'taxable' ? g * (1 - TAX) : g;
  }
  if (div >= 1) { deposit(S, Math.round(div), 'invest', 'Cổ tức'); msgs.push(`💹 Nhận cổ tức ${yen(div)}.`); }
  // NISA: sang năm dương lịch mới thì hạn mức năm được làm mới
  if (F.nisa.year !== calYear(S)) { F.nisa.year = calYear(S); F.nisa.usedT = 0; F.nisa.usedG = 0; }
  // tích lũy hằng tháng
  if (F.plan) {
    const r = buy(S, F.plan.id, F.plan.amount, F.plan.acct, true);
    msgs.push(r.ok ? `📈 Tích lũy tự động ${yen(F.plan.amount)} vào ${secOf(F.plan.id).name}.` : `⚠️ Không đủ tiền trong tài khoản để tích lũy tháng này.`);
  }
  // lãi tiết kiệm (rất thấp)
  if (F.savings > 0) { const i = Math.floor(F.savings * 0.002 / 12 * (1 - TAX)); if (i > 0) { F.savings += i; } }
  // trả góp khoản vay
  for (const d of F.debts.filter((x) => x.status === 'active' && (x.kind === 'bank' || x.kind === 'card' || x.kind === 'mortgage'))) {
    if (d.balance <= 0) continue;
    const interest = Math.round(d.balance * d.rate / 12);
    // vay mua nhà: trả góp đều (khoản góp đã gồm lãi); vay thường: gốc cố định + lãi
    const due = d.kind === 'card' ? Math.max(5000, Math.round(d.balance * 0.05)) + interest : d.kind === 'mortgage' ? Math.min(d.balance + interest, d.installment) : Math.min(d.balance + interest, d.installment + interest);
    if (F.bank >= due) {
      bankPay(S, due, 'loan', `Trả góp ${d.lender} (lãi ${yen(interest)})`);
      d.balance = Math.max(0, d.balance + interest - due);
      d.missed = 0;
      F.credit = Math.min(850, F.credit + 4);
      if (d.balance <= 0) { d.status = 'paid'; msgs.push(`✅ Đã trả hết khoản vay ${esc(d.lender)}.`); }
    } else {
      d.balance += interest + 2000; d.missed = (d.missed || 0) + 1;
      F.credit = Math.max(300, F.credit - 60);
      msgs.push(`❗ Không đủ tiền trả góp ${esc(d.lender)} — bị phạt trễ hạn, điểm tín dụng giảm.`);
      if (d.missed >= 3) { d.status = 'default'; F.credit = 300; msgs.push(`🚨 Khoản vay ${esc(d.lender)} bị chuyển sang thu hồi nợ. Bạn bị ghi vào danh sách đen tín dụng nhiều năm.`); }
    }
  }
  if (F.card) { const cd = F.debts.find((x) => x.id === 'card'); if (cd) { F.card.balance = Math.max(0, cd.balance); if (cd.status === 'paid') cd.status = 'active'; } }
  // chi phí duy trì tài sản + tinh thần từ tài sản
  const upkeep = F.assets.reduce((a, x) => { const A = ASSETS.find((y) => y.id === x.id); return a + (A ? A.upkeep || 0 : 0); }, 0);
  if (upkeep) bankPay(S, upkeep, 'shop', 'Chi phí duy trì tài sản (xăng, bảo hiểm, chỗ đậu…)');
  const m = assetEffect(S, 'mood');
  if (m) applyFx(S, { mood: m });
  // quay số
  const draws = F.tickets.filter((t) => t.draw <= S.day);
  if (draws.length) {
    F.tickets = F.tickets.filter((t) => t.draw > S.day);
    let won = 0;
    for (const t of draws) won += drawTickets(S, t.type, t.n, `${t.type}:${t.day}`);
    msgs.push(won ? `🎫 Kết quả xổ số: bạn trúng ${yen(won)}!` : '🎫 Kết quả xổ số: không trúng giải nào.');
    if (won) earn(S, won, 'invest', 'Trúng xổ số');
  }
  if (ctx) ctx.msgs.push(...msgs);
  return msgs;
}

// ---------- mua / bán ----------
function nisaRoom(S, acct) {
  const N = S.fin.nisa;
  if (!N.open) return 0;
  const life = NISA_LIFE - N.life;
  return Math.max(0, Math.min(life, acct === 'nisa_t' ? NISA_T - N.usedT : NISA_G - N.usedG));
}
export function buy(S, id, amount, acct = 'taxable', fromPlan = false) {
  const s = secOf(id), F = S.fin, p = priceOf(S, id);
  if (s.kind !== 'fund') amount = Math.floor(amount / p) * p;
  if (amount <= 0 || F.bank < amount) return { ok: false, why: 'Tài khoản không đủ tiền (nạp tiền mặt vào tài khoản trước)' };
  if (acct === 'nisa_t' && !(s.nisa === 'tsumitate' || s.nisa === 'both')) return { ok: false, why: 'Sản phẩm này không thuộc khung tích lũy NISA' };
  if (acct === 'nisa_g' && s.nisa === 'none') return { ok: false, why: 'Sản phẩm này không mua được bằng NISA' };
  if (acct !== 'taxable' && nisaRoom(S, acct) < amount) return { ok: false, why: 'Vượt hạn mức NISA còn lại' };
  bankPay(S, amount, 'invest', `${fromPlan ? 'Tích lũy' : 'Mua'} ${s.name}`);
  const h = F.port[id] || (F.port[id] = { units: 0, cost: 0, acct });
  if (h.acct !== acct && h.units > 0) { // gộp đơn giản: giữ loại tài khoản cũ
    acct = h.acct;
  }
  h.acct = acct;
  h.units += amount / p; h.cost += amount;
  if (acct === 'nisa_t') { F.nisa.usedT += amount; F.nisa.life += amount; }
  if (acct === 'nisa_g') { F.nisa.usedG += amount; F.nisa.life += amount; }
  return { ok: true };
}
export function sell(S, id, frac = 1) {
  const F = S.fin, h = F.port[id];
  if (!h) return 0;
  const units = h.units * frac, value = units * priceOf(S, id), costPart = h.cost * frac;
  const gain = value - costPart;
  const tax = h.acct === 'taxable' && gain > 0 ? gain * TAX : 0;
  deposit(S, Math.round(value - tax), 'invest', `Bán ${secOf(id).name}${tax ? ` (thuế ${yen(tax)})` : ''}`);
  if (h.acct !== 'taxable') F.nisa.life = Math.max(0, F.nisa.life - costPart); // hạn mức đời được trả lại năm sau (đơn giản hóa)
  h.units -= units; h.cost -= costPart;
  if (h.units < 1e-6) delete F.port[id];
  return Math.round(value - tax);
}

// ---------- xổ số ----------
function drawTickets(S, type, n, salt) {
  const L = LOTTERIES.find((x) => x.id === type);
  let won = 0;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let acc = 0;
    for (const pz of [...L.prizes].sort((a, b) => b.amount - a.amount)) { acc += pz.p; if (r < acc) { won += pz.amount; break; } }
  }
  return won;
}

// ---------- vay ----------
const legalRate = (amt) => (amt < 100000 ? 0.2 : amt < 1000000 ? 0.18 : 0.15);  // trần theo 利息制限法
function loanOffer(S) {
  const F = S.fin, v = S.career.visa;
  if (F.debts.some((d) => d.status === 'default')) return { ok: false, why: 'Bạn đang có nợ xấu — ngân hàng từ chối.' };
  if (v.startsWith('tts')) return { ok: false, why: 'Thực tập sinh gần như không vay được ngân hàng ở Nhật (thời hạn lưu trú ngắn, không được đổi việc).' };
  if (S.day < 84) return { ok: false, why: 'Cần ở Nhật ít nhất 1 năm và có lịch sử lương ổn định.' };
  if (F.credit < 550) return { ok: false, why: `Điểm tín dụng ${F.credit} quá thấp (cần từ 550).` };
  if (F.debts.some((d) => d.status === 'active' && d.kind === 'bank')) return { ok: false, why: 'Bạn đang có một khoản vay chưa trả xong.' };
  const max = ({ ssw1: 300000, ssw2: 800000, spouse: 1000000, pr: 2000000 })[v] || 300000;
  return { ok: true, max: Math.round(max * (F.credit / 700)) };
}

// ---------- vay mua nhà (住宅ローン) ----------
// Người nước ngoài thường phải có vĩnh trú hoặc visa vợ/chồng người Nhật; kỹ sư / KNĐĐ2 ở lâu, tín dụng tốt có thể được.
// Kỳ hạn 35 năm (420 tháng), trả góp đều; hạn mức ~7 lần thu nhập năm.
export function mortgageOffer(S, amount, yearIncome) {
  const F = S.fin, v = S.career.visa;
  if (F.debts.some((d) => d.status === 'default')) return { ok: false, why: 'Bạn đang có nợ xấu — ngân hàng từ chối.' };
  if (F.debts.some((d) => d.status === 'active' && d.kind === 'mortgage')) return { ok: false, why: 'Bạn đang có một khoản vay mua nhà chưa trả xong.' };
  let rate;
  if (v === 'pr' || v === 'spouse') rate = 0.009;
  else if ((v === 'eng' || v === 'ssw2') && S.day >= 3 * 84 && (F.credit || 600) >= 650) rate = 0.016;
  else return { ok: false, why: 'Ngân hàng chỉ cho người nước ngoài vay mua nhà khi có vĩnh trú (永住) hoặc visa vợ/chồng người Nhật; kỹ sư / KNĐĐ số 2 cần ở Nhật ≥ 3 năm và điểm tín dụng ≥ 650.' };
  if ((F.credit || 600) < 600) return { ok: false, why: `Điểm tín dụng ${F.credit} quá thấp (cần từ 600).` };
  if (!yearIncome) return { ok: false, why: 'Cần đang có việc làm ổn định.' };
  if (amount > yearIncome * 7) return { ok: false, why: `Khoản vay ${yen(amount)} vượt 7 lần thu nhập năm (${yen(yearIncome * 7)}).` };
  const n = 420, r = rate / 12;
  const installment = Math.ceil(amount * r / (1 - Math.pow(1 + r, -n)));
  return { ok: true, rate, installment, n };
}
export function takeMortgage(S, amount, offer, what) {
  addDebt(S, { id: 'mortgage' + S.day, kind: 'mortgage', lender: `Vay mua nhà (住宅ローン) · ${what}`, currency: 'JPY', principal: amount, balance: amount, rate: offer.rate, installment: offer.installment, start: S.day });
  deposit(S, amount, 'loan', 'Giải ngân vay mua nhà');
}

// ---------- giao diện app ----------
const row = (a, b) => `<div class="prow"><span>${a}</span><span>${b}</span></div>`;
function summaryHtml(S) {
  const F = S.fin;
  const debts = F.debts.filter((d) => d.status !== 'paid' && d.balance > 0).map((d) => row(`🏦 ${esc(d.lender)}${d.status === 'default' ? ' (nợ xấu)' : ''}`, d.currency === 'VND' ? vnd(d.balance) : yen(d.balance))).join('');
  return `<div class="payslip">${row('👛 Tiền mặt', yen(F.cash))}${row('🏧 Tài khoản ゆうちょ', yen(F.bank))}${row('🐷 Tiết kiệm có kỳ hạn', yen(F.savings))}${row('📈 Đầu tư (giá trị hiện tại)', yen(portfolioValue(S)))}${F.card ? row('💳 Dư nợ thẻ', yen(F.card.balance)) : ''}${debts}
    <div class="prow net"><span>Tài sản ròng (quy ra yên)</span><span>${yen(netWorth(S))}</span></div></div>
    <p class="dim">Tỷ giá tháng này: 1¥ ≈ ${F.fx}₫ · Điểm tín dụng: ${F.credit}</p>`;
}

export async function openBank(S) {
  for (;;) {
    const v = await modal({
      who: '🏦 App ngân hàng', title: 'Ngân hàng & tài chính', wide: true, html: summaryHtml(S),
      choices: [
        { label: '🏧 Nạp / rút tiền (ví ↔ tài khoản)', value: 'atm' },
        { label: '💸 Chuyển tiền về Việt Nam', sub: `Tỷ giá ${S.fin.fx}₫/¥ · công ty có giấy phép`, value: 'remit' },
        { label: '🐷 Tiết kiệm có kỳ hạn', value: 'save' },
        { label: '📈 Đầu tư: quỹ, cổ phiếu, NISA', value: 'invest' },
        { label: '🏦 Vay & thẻ tín dụng', value: 'loan' },
        { label: '🎫 Vé số', value: 'lotto' },
        { label: '🛍️ Mua sắm tài sản, thi bằng lái', value: 'shop' },
        { label: '📜 Lịch sử & báo cáo tháng', value: 'history' },
        { label: '✖ Đóng app', value: null, cancel: true },
      ],
    });
    if (!v) return;
    await ({ atm, remit: remitApp, save: savingsMenu, invest: investMenu, loan: loanMenu, lotto: lottoMenu, shop: shopMenu, history: historyMenu })[v](S);
  }
}

async function atm(S) {
  const F = S.fin;
  const v = await modal({
    who: 'ATM', title: '🏧 Nạp / rút', html: summaryHtml(S),
    choices: [
      { label: 'Nạp ¥10,000 vào tài khoản', value: 10000, disabled: F.cash < 10000, reason: 'Không đủ tiền mặt' },
      { label: 'Nạp toàn bộ tiền mặt', value: 'all-in', disabled: F.cash < 1 },
      { label: 'Rút ¥10,000 ra tiền mặt', value: -10000, disabled: F.bank < 10000, reason: 'Tài khoản không đủ' },
      { label: 'Rút ¥30,000', value: -30000, disabled: F.bank < 30000, reason: 'Tài khoản không đủ' },
      { label: '← Quay lại', value: 0, cancel: true },
    ],
  });
  if (!v) return;
  if (v === 'all-in') moveCash(S, true, F.cash);
  else if (v > 0) moveCash(S, true, v);
  else moveCash(S, false, -v);
  toast('🏧 Xong');
}

async function remitApp(S) {
  const F = S.fin;
  const fee = atLeast(S, 'long', 2) ? 500 : 990;
  const all = Math.floor((spendable(S) - 5000 - fee) / 1000) * 1000;
  const v = await modal({
    who: 'Chuyển tiền quốc tế', title: '💸 Gửi về Việt Nam', text: `${FIN_TEXT.remit}<br>Phí ${yen(fee)}/lần. Tỷ giá hôm nay: <b>1¥ = ${F.fx}₫</b>.`,
    choices: [
      ...[20000, 50000, 100000].map((a) => ({ label: `${yen(a)} → ${vnd(a * F.fx)}`, value: a, disabled: spendable(S) < a + fee, reason: 'Không đủ tiền' })),
      ...(all > 0 ? [{ label: `Tất cả, chừa ¥5,000: ${yen(all)} → ${vnd(all * F.fx)}`, value: all }] : []),
      { label: '← Quay lại', value: 0, cancel: true },
    ],
  });
  if (!v) return;
  pay(S, v + fee, 'remit', `Chuyển ${yen(v)} về nhà qua app`);
  const money = v * F.fx;
  S.debt -= money;
  S.stats.sentVnd += money;
  if (S.family) { S.family.lastRemit = S.day; S.family.sat = Math.min(100, S.family.sat + Math.min(15, Math.round(v / 4000))); }
  addLog(S, `Gửi về ${vnd(money)} (tỷ giá ${F.fx})`);
  sfx('coin');
  await modal({ title: '✅ Đã chuyển', text: `Gia đình nhận <b>${vnd(money)}</b>. Nợ còn: <b>${vnd(Math.max(0, S.debt))}</b>.<br><span class="dim">Tỷ giá thay đổi mỗi tháng — gửi lúc yên cao thì nhà nhận được nhiều hơn.</span>` });
}

async function savingsMenu(S) {
  const F = S.fin;
  const v = await modal({
    who: '定期預金', title: '🐷 Tiết kiệm có kỳ hạn', text: FIN_TEXT.savings, html: summaryHtml(S),
    choices: [
      { label: 'Gửi ¥50,000', value: 50000, disabled: F.bank < 50000, reason: 'Tài khoản không đủ' },
      { label: 'Gửi ¥100,000', value: 100000, disabled: F.bank < 100000, reason: 'Tài khoản không đủ' },
      { label: 'Rút toàn bộ về tài khoản', value: -1, disabled: F.savings <= 0 },
      { label: '← Quay lại', value: 0, cancel: true },
    ],
  });
  if (!v) return;
  if (v > 0) { F.bank -= v; F.savings += v; toast(`🐷 Đã gửi ${yen(v)}`); }
  else { F.bank += F.savings; toast(`🐷 Đã rút ${yen(F.savings)}`); F.savings = 0; }
}

function holdingsHtml(S) {
  const rows = Object.entries(S.fin.port).map(([id, h]) => {
    const s = secOf(id), val = h.units * priceOf(S, id), pl = val - h.cost;
    return row(`${esc(s.name)} <small class="dim">${h.acct === 'taxable' ? 'tài khoản thường' : h.acct === 'nisa_t' ? 'NISA tích lũy' : 'NISA tăng trưởng'}</small>`, `${yen(val)} <b class="${pl >= 0 ? 'pos' : 'neg'}">${pl >= 0 ? '+' : ''}${yen(pl)}</b>`);
  }).join('');
  const N = S.fin.nisa;
  return `<div class="payslip">${rows || '<div class="dim">Chưa nắm giữ gì</div>'}</div>
    <p class="dim">NISA: ${N.open ? `đã mở · năm nay dùng ${yen(N.usedT)}/${yen(NISA_T)} (tích lũy), ${yen(N.usedG)}/${yen(NISA_G)} (tăng trưởng) · tổng đời ${yen(N.life)}/${yen(NISA_LIFE)}` : 'chưa mở'}${S.fin.plan ? ` · Tích lũy tự động: ${yen(S.fin.plan.amount)}/tháng vào ${esc(secOf(S.fin.plan.id).name)}` : ''}</p>`;
}

async function investMenu(S) {
  for (;;) {
    const F = S.fin;
    const v = await modal({
      who: '証券口座', title: '📈 Đầu tư', wide: true, text: FIN_TEXT.stocks, html: holdingsHtml(S),
      choices: [
        ...(F.nisa.open ? [] : [{ label: '🆕 Mở tài khoản NISA', sub: 'Miễn thuế lãi đầu tư', value: 'nisa' }]),
        { label: '🛒 Mua quỹ đầu tư (投資信託)', value: 'fund' },
        { label: '🏢 Mua cổ phiếu', value: 'stock' },
        { label: '💰 Bán bớt', value: 'sell', disabled: !Object.keys(F.port).length, reason: 'Chưa có gì để bán' },
        { label: F.plan ? '⏹ Dừng tích lũy hằng tháng' : '🔁 Đặt tích lũy hằng tháng (積立)', value: 'plan' },
        { label: '← Quay lại', value: null, cancel: true },
      ],
    });
    if (!v) return;
    if (v === 'nisa') { await modal({ title: 'NISA', text: FIN_TEXT.nisa, ok: 'Mở tài khoản' }); F.nisa.open = true; F.nisa.year = calYear(S); addLog(S, 'Mở tài khoản NISA'); toast('🆕 Đã mở NISA'); }
    if (v === 'fund' || v === 'stock') await buyFlow(S, v === 'fund' ? FUNDS : STOCKS);
    if (v === 'sell') await sellFlow(S);
    if (v === 'plan') {
      if (F.plan) { F.plan = null; toast('⏹ Đã dừng tích lũy'); continue; }
      const id = await pickSec(S, FUNDS, 'Chọn quỹ để tích lũy mỗi tháng');
      if (!id) continue;
      const amt = await modal({ title: 'Mỗi tháng bao nhiêu?', choices: [10000, 20000, 33000, 50000].map((a) => ({ label: yen(a), value: a })).concat([{ label: 'Thôi', value: 0, cancel: true }]) });
      if (amt) { F.plan = { id, amount: amt, acct: F.nisa.open && ['tsumitate', 'both'].includes(secOf(id).nisa) ? 'nisa_t' : 'taxable' }; toast('🔁 Đã đặt tích lũy hằng tháng'); }
    }
  }
}
async function pickSec(S, list, title) {
  return modal({
    who: 'Chọn sản phẩm', title, wide: true,
    choices: list.map((s) => ({ label: `${s.name} · ${yen(priceOf(S, s.id))}`, sub: `${esc(s.desc)}<br>Lợi nhuận kỳ vọng ~${Math.round(s.mu * 100)}%/năm · biến động ${Math.round(s.sigma * 100)}%${s.dividend ? ` · cổ tức ${(s.dividend * 100).toFixed(1)}%` : ''}${s.nisa && s.nisa !== 'none' ? ' · NISA ✓' : ''}`, value: s.id })).concat([{ label: '← Quay lại', value: null, cancel: true }]),
  });
}
async function buyFlow(S, list) {
  const id = await pickSec(S, list, list === FUNDS ? 'Mua quỹ đầu tư' : 'Mua cổ phiếu');
  if (!id) return;
  const s = secOf(id), p = priceOf(S, id), F = S.fin;
  const amounts = s.kind === 'fund' ? [10000, 30000, 100000] : [1, 10, 50].map((n) => n * p);
  const amt = await modal({ title: `Mua ${s.name}`, text: `Tài khoản có ${yen(F.bank)}.`, choices: amounts.map((a) => ({ label: s.kind === 'fund' ? yen(a) : `${Math.round(a / p)} cổ phiếu · ${yen(a)}`, value: a, disabled: F.bank < a, reason: 'Tài khoản không đủ' })).concat([{ label: 'Thôi', value: 0, cancel: true }]) });
  if (!amt) return;
  let acct = 'taxable';
  if (F.nisa.open && s.nisa !== 'none') {
    acct = await modal({ title: 'Mua bằng tài khoản nào?', text: FIN_TEXT.nisa, choices: [
      ...(['tsumitate', 'both'].includes(s.nisa) ? [{ label: 'NISA — khung tích lũy (つみたて)', sub: `Còn ${yen(nisaRoom(S, 'nisa_t'))}`, value: 'nisa_t' }] : []),
      { label: 'NISA — khung tăng trưởng (成長)', sub: `Còn ${yen(nisaRoom(S, 'nisa_g'))}`, value: 'nisa_g' },
      { label: 'Tài khoản thường (chịu thuế 20,315%)', value: 'taxable' },
    ] });
  }
  const r = buy(S, id, amt, acct);
  if (!r.ok) { await modal({ title: 'Không mua được', text: r.why }); return; }
  sfx('coin'); addLog(S, `Mua ${s.name} ${yen(amt)}`);
  toast(`📈 Đã mua ${yen(amt)} ${s.name}`);
}
async function sellFlow(S) {
  const F = S.fin;
  const id = await modal({ title: 'Bán gì?', choices: Object.keys(F.port).map((k) => ({ label: `${secOf(k).name} · ${yen(F.port[k].units * priceOf(S, k))}`, value: k })).concat([{ label: 'Thôi', value: null, cancel: true }]) });
  if (!id) return;
  const frac = await modal({ title: 'Bán bao nhiêu?', choices: [{ label: 'Một nửa', value: 0.5 }, { label: 'Toàn bộ', value: 1 }, { label: 'Thôi', value: 0, cancel: true }] });
  if (!frac) return;
  const got = sell(S, id, frac);
  sfx('coin');
  toast(`💰 Bán xong, nhận ${yen(got)} vào tài khoản`);
}

async function loanMenu(S) {
  const F = S.fin;
  const offer = loanOffer(S);
  const v = await modal({
    who: 'ローン', title: '🏦 Vay & thẻ tín dụng', text: FIN_TEXT.loan,
    html: `<p class="dim">Điểm tín dụng: <b>${F.credit}</b>. ${offer.ok ? `Ngân hàng có thể cho vay tối đa <b>${yen(offer.max)}</b>, trả góp 12 tháng.` : esc(offer.why)}</p>`,
    choices: [
      { label: '📝 Vay ngân hàng', value: 'loan', disabled: !offer.ok, reason: offer.why },
      { label: F.card ? `💳 Rút tiền mặt bằng thẻ (キャッシング) · hạn mức ${yen(F.card.limit - F.card.balance)}` : '💳 Làm thẻ tín dụng', sub: FIN_TEXT.card, value: 'card' },
      { label: '💵 Trả bớt nợ thẻ', value: 'paycard', disabled: !F.card || !F.card.balance },
      { label: '← Quay lại', value: null, cancel: true },
    ],
  });
  if (v === 'loan') {
    const amt = await modal({ title: 'Vay bao nhiêu?', choices: [100000, 300000, 500000, 1000000].filter((a) => a <= offer.max).map((a) => ({ label: `${yen(a)} · lãi ${Math.round(legalRate(a) * 100)}%/năm`, sub: `Trả khoảng ${yen(Math.round(a / 12 + a * legalRate(a) / 12))}/tháng`, value: a })).concat([{ label: 'Thôi', value: 0, cancel: true }]) });
    if (!amt) return;
    deposit(S, amt, 'loan', 'Giải ngân khoản vay ngân hàng');
    addDebt(S, { id: 'bank' + S.day, kind: 'bank', lender: 'Khoản vay ngân hàng', currency: 'JPY', principal: amt, balance: amt, rate: legalRate(amt), installment: Math.round(amt / 12) });
    addLog(S, `Vay ngân hàng ${yen(amt)}`);
    toast(`🏦 Đã nhận ${yen(amt)} vào tài khoản`);
  }
  if (v === 'card') {
    if (!F.card) {
      const ok = !S.career.visa.startsWith('tts') && F.credit >= 580 && S.day >= 42;
      if (!ok) { await modal({ title: 'Hồ sơ bị từ chối', text: S.career.visa.startsWith('tts') ? 'Thực tập sinh thường chỉ làm được thẻ ghi nợ (デビットカード), không được cấp thẻ tín dụng.' : 'Cần ở Nhật đủ lâu và điểm tín dụng từ 580.' }); return; }
      F.card = { limit: F.credit >= 700 ? 300000 : 100000, balance: 0 };
      addDebt(S, { id: 'card', kind: 'card', lender: 'Thẻ tín dụng', currency: 'JPY', principal: 0, balance: 0, rate: 0.18, installment: 0 });
      toast('💳 Đã được cấp thẻ tín dụng');
      return;
    }
    const room = F.card.limit - F.card.balance;
    const amt = await modal({ title: 'Rút bao nhiêu?', text: 'Lãi 18%/năm, trả tối thiểu mỗi tháng. Dễ sa vào vòng nợ!', choices: [10000, 30000, 50000].filter((a) => a <= room).map((a) => ({ label: yen(a), value: a })).concat([{ label: 'Thôi', value: 0, cancel: true }]) });
    if (!amt) return;
    F.card.balance += amt;
    const d = F.debts.find((x) => x.id === 'card'); d.balance += amt; d.status = 'active';
    earn(S, amt, 'loan', 'Rút tiền mặt bằng thẻ');
  }
  if (v === 'paycard') {
    const d = F.debts.find((x) => x.id === 'card');
    const amt = Math.min(d.balance, F.bank);
    if (amt <= 0) { toast('Tài khoản không đủ'); return; }
    bankPay(S, amt, 'loan', 'Trả nợ thẻ'); d.balance -= amt; F.card.balance = d.balance;
    toast(`💳 Đã trả ${yen(amt)}`);
  }
}

async function lottoMenu(S) {
  const v = await modal({
    who: '宝くじ', title: '🎫 Vé số', text: FIN_TEXT.lottery,
    choices: LOTTERIES.map((L) => ({ label: `${L.name} · ${yen(L.price)}/vé`, sub: `${esc(L.desc)}`, value: L.id })).concat([{ label: '← Quay lại', value: null, cancel: true }]),
  });
  if (!v) return;
  const L = LOTTERIES.find((x) => x.id === v);
  const n = await modal({ title: `Mua ${L.name}`, choices: [1, 10, 30].map((k) => ({ label: `${k} vé · ${yen(k * L.price)}`, value: k, disabled: S.money < k * L.price, reason: 'Không đủ tiền' })).concat([{ label: 'Thôi', value: 0, cancel: true }]) });
  if (!n) return;
  pay(S, n * L.price, 'shop', `Mua ${n} vé ${L.name}`);
  if (L.id === 'scratch') {
    const won = drawTickets(S, L.id, n, `${S.day}:${S.time}`);
    if (won) earn(S, won, 'invest', 'Trúng vé cào');
    sfx(won ? 'coin' : 'bad');
    await modal({ title: won ? `🎉 Trúng ${yen(won)}!` : '😶 Không trúng', text: `Bạn cào ${n} vé, tốn ${yen(n * L.price)}${won ? `, trúng ${yen(won)}` : ''}. Về lâu dài, mua vé số luôn lỗ khoảng một nửa số tiền bỏ ra.` });
  } else {
    S.fin.tickets.push({ type: L.id, n, day: S.day, draw: S.day + 7 - ((S.day - 1) % 7) });
    toast(`🎫 Đã mua ${n} vé — có kết quả vào cuối tháng`);
  }
}

async function shopMenu(S) {
  const F = S.fin;
  const own = (id) => F.assets.some((x) => x.id === id);
  const v = await modal({
    who: 'Mua sắm', title: '🛍️ Tài sản & bằng lái', wide: true,
    choices: [
      ...ASSETS.map((A) => {
        const need = A.req && A.req !== 'parking' && !F.licenses.includes(A.req);
        return { label: `${own(A.id) ? '✅ ' : ''}${A.name} · ${yen(A.price)}${A.upkeep ? ` (+${yen(A.upkeep)}/tháng)` : ''}`, sub: esc(A.desc), value: 'a:' + A.id, disabled: !own(A.id) && (need || spendable(S) < A.price), reason: need ? 'Cần bằng lái trước' : 'Không đủ tiền' };
      }),
      ...LICENSES.map((L) => ({ label: `${F.licenses.includes(L.id) ? '✅ ' : '🪪 '}${L.name} · ${yen(L.price)}`, sub: esc(L.desc), value: 'l:' + L.id, disabled: F.licenses.includes(L.id) || spendable(S) < L.price, reason: F.licenses.includes(L.id) ? 'Đã có' : 'Không đủ tiền' })),
      { label: '← Quay lại', value: null, cancel: true },
    ],
  });
  if (!v) return;
  const [k, id] = v.split(':');
  if (k === 'l') {
    const L = LICENSES.find((x) => x.id === id);
    pay(S, L.price, 'study', L.name);
    F.licenses.push(id);
    addLog(S, `Có ${L.name}`);
    sfx('end');
    await modal({ title: `🪪 ${L.name}`, text: `Bạn đã đỗ và nhận ${esc(L.name)}. ${id === 'license_car' ? 'Có bằng lái ô tô cũng là lợi thế khi tìm việc ở vùng quê, kho vận.' : ''}` });
    return;
  }
  const A = ASSETS.find((x) => x.id === id);
  if (own(id)) {
    const ok = await modal({ title: `Bán ${A.name}?`, text: `Bán lại được khoảng ${yen(A.price * (A.resale || 0))}.`, choices: [{ label: 'Bán', value: true }, { label: 'Giữ lại', value: false, cancel: true }] });
    if (ok) { F.assets = F.assets.filter((x) => x.id !== id); earn(S, Math.round(A.price * (A.resale || 0)), 'shop', `Bán ${A.name}`); }
    return;
  }
  pay(S, A.price, 'shop', `Mua ${A.name}`);
  F.assets.push({ id, bought: S.day });
  addLog(S, `Mua ${A.name}`);
  sfx('coin');
  const out = applyFx(S, { mood: 4 });
  await modal({ title: `🛍️ ${A.name}`, text: esc(A.desc), html: chips([['money', -A.price], ...out]) });
}

async function historyMenu(S) {
  const key = Math.ceil(S.day / 7);
  const rep = (k) => {
    const r = monthReport(S, k);
    const rows = Object.entries(r.m).sort((a, b) => a[1] - b[1]).map(([c, a]) => `<div class="prow${a < 0 ? ' neg' : ''}"><span>${CAT[c] || c}</span><span>${a < 0 ? '−' : '+'}${yen(Math.abs(a))}</span></div>`).join('');
    return `${rows || '<div class="dim">Chưa có giao dịch</div>'}<div class="prow net"><span>Thu ${yen(r.inc)} · Chi ${yen(-r.out)}</span><span>${yen(r.inc + r.out)}</span></div>`;
  };
  const tx = S.fin.tx.slice(0, 30).map((t) => `<li><span class="dim">Ngày ${t.d}</span> ${esc(t.m || CAT[t.c] || '')} <b class="${t.a < 0 ? 'neg' : 'pos'}">${t.a < 0 ? '−' : '+'}${yen(Math.abs(t.a))}</b></li>`).join('');
  await modal({ who: 'Lịch sử', title: '📜 Thu chi', wide: true, html: `<h3>Tháng này</h3><div class="payslip">${rep(key)}</div>${key > 1 ? `<h3>Tháng trước</h3><div class="payslip">${rep(key - 1)}</div>` : ''}<h3>Giao dịch gần đây</h3><ul class="log">${tx}</ul>`, ok: 'Đóng' });
}
