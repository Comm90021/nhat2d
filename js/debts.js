// Trang trả nợ chung: mọi khoản nợ ở một chỗ — trả một phần, trả hết ngay, trả hết tất cả,
// đặt tự động gửi về trả nợ quê mỗi tháng. Kèm mục "người nợ bạn".
import { yen, vnd, addLog, applyFx, clamp } from './state.js';
import { modal, chips, esc, toast, formValues } from './ui.js';
import { bankPay, spendable, earn } from './finance.js';
import { fam, famGain } from './family.js';
import { PEOPLE, P, gain } from './social.js';
import { atLeast } from './social.js';
import { dayRoll, repayChance } from './ai/rules.js';
import { sfx } from './audio.js';

const KIND = { home: '🏡 Nợ ở quê', bank: '🏦 Vay ngân hàng', card: '💳 Thẻ tín dụng', shark: '🦈 Vay nóng', mortgage: '🏠 Vay mua nhà' };
const active = (S) => S.fin.debts.filter((d) => d.status === 'active' && d.balance > 0);
const remitFee = (S) => (atLeast(S, 'long', 2) ? 500 : 990);

// Số yên cần để trả hết một khoản ngay hôm nay
export function payoffYen(S, d) {
  if (d.currency === 'VND') return Math.ceil(d.balance / S.fin.fx) + remitFee(S);
  if (d.kind === 'bank' || d.kind === 'mortgage') { const daysIn = (S.day - (d.lastPay || d.start || S.day)); return Math.round(d.balance * (1 + d.rate * Math.min(7, Math.max(0, daysIn)) / 84)); } // lãi tính tới hôm nay (1 tháng = 7 ngày)
  return Math.round(d.balance);
}
const interestNote = (d) => (d.kind === 'shark' ? 'lãi cắt cổ, vượt trần pháp luật (15–20%/năm)' : d.rate ? `lãi ${Math.round(d.rate * 100)}%/năm` : 'không lãi');

// Trả một khoản theo số yên. Trả về số yên thực đã chi.
function payDebt(S, d, yenAmt) {
  if (yenAmt <= 0) return 0;
  if (d.currency === 'VND') {
    const fee = remitFee(S);
    const net = Math.max(0, yenAmt - fee);
    const v = Math.min(d.balance, net * S.fin.fx);
    const cost = Math.ceil(v / S.fin.fx) + fee;
    bankPay(S, cost, 'remit', `Chuyển tiền về trả nợ (phí ${fee}¥)`);
    d.balance -= v; S.stats.sentVnd += v;
    fam(S).lastRemit = S.day; famGain(S, Math.min(15, Math.round(cost / 4000)));
    if (d.balance <= 1) { d.balance = 0; d.status = 'paid'; }
    return cost;
  }
  const full = payoffYen(S, d);
  const amt = Math.min(yenAmt, full);
  bankPay(S, amt, 'loan', `Trả ${d.lender}`);
  if (amt >= full) {
    d.balance = 0; d.status = 'paid';
    if (d.kind === 'bank' || d.kind === 'mortgage') S.fin.credit = Math.min(850, (S.fin.credit || 600) + 15);
    if (d.kind === 'card' && S.fin.card) S.fin.card.balance = 0;
  } else {
    d.balance = Math.max(0, d.balance - amt);
    if (d.kind === 'card' && S.fin.card) S.fin.card.balance = d.balance;
  }
  d.lastPay = S.day;
  return amt;
}

function debtRow(S, d) {
  const bal = d.currency === 'VND' ? vnd(d.balance) : yen(d.balance);
  const due = d.due ? ` · hạn còn ${d.due - S.day} ngày` : d.installment ? ` · góp ${yen(d.installment)}/tháng` : d.currency === 'VND' ? ` · tỷ giá ${S.fin.fx}₫/¥` : '';
  return `<div class="prow"><span>${KIND[d.kind] || '💸'} ${esc(d.lender)}<br><span class="dim small">${interestNote(d)}${due}</span></span><span><b>${bal}</b><br><span class="dim small">trả hết: ${yen(payoffYen(S, d))}</span></span></div>`;
}

export async function openDebts(S) {
  for (;;) {
    const list = active(S).sort((a, b) => (b.kind === 'shark') - (a.kind === 'shark') || (b.rate || 0) - (a.rate || 0));
    const total = list.reduce((a, d) => a + payoffYen(S, d), 0);
    const recv = S.fin.receivables.filter((r) => r.status === 'open');
    const plan = S.fin.homePlan;
    const v = await modal({
      who: 'Quản lý nợ', title: '💸 Trả nợ', wide: true,
      html: `<div class="payslip">${list.map((d) => debtRow(S, d)).join('') || '<div class="dim">🎉 Bạn không còn khoản nợ nào!</div>'}
        <div class="prow net"><span>Tổng cần để trả hết (quy ra yên)</span><span>${yen(total)}</span></div>
        <div class="prow"><span>Tiền đang có (tài khoản + tiền mặt)</span><span>${yen(spendable(S))}</span></div></div>
        ${plan ? `<p class="dim">🔁 Tự động gửi về trả nợ quê: ${yen(plan)} mỗi cuối tháng.</p>` : ''}
        ${recv.length ? `<h3>Người nợ bạn</h3><div class="payslip">${recv.map((r) => `<div class="prow"><span>${esc(PEOPLE[r.npc] ? PEOPLE[r.npc].name : r.npc)}</span><span>${yen(r.amount)} · hẹn ngày ${r.due}</span></div>`).join('')}</div>` : ''}
        <p class="dim">Trả bằng tài khoản trước, thiếu thì lấy tiền mặt. Nợ ở quê chuyển qua app (phí ${remitFee(S)}¥/lần, tỷ giá tháng này).</p>`,
      choices: [
        ...list.map((d, i) => ({ label: `${KIND[d.kind] || '💸'} ${esc(d.lender)}`, sub: 'Trả một phần / trả hết', value: 'd' + i })),
        ...(list.length ? [{ label: '💸 Trả hết tất cả', sub: `Cần ${yen(total)} · ưu tiên khoản lãi cao`, value: 'all', disabled: spendable(S) < Math.min(...list.map((d) => payoffYen(S, d))), reason: 'Không đủ tiền trả hết khoản nào' }] : []),
        ...(list.some((d) => d.kind === 'home') ? [{ label: plan ? '🔁 Đổi / tắt tự động trả nợ quê' : '🔁 Tự động gửi về trả nợ quê mỗi tháng', value: 'plan' }] : []),
        ...recv.map((r, i) => ({ label: `📨 Nhắn đòi nợ ${esc(PEOPLE[r.npc] ? PEOPLE[r.npc].name : r.npc)}`, sub: `${yen(r.amount)}`, value: 'r' + i, disabled: r.asked === S.day, reason: 'Hôm nay đã nhắc rồi' })),
        { label: '← Quay lại', value: null, cancel: true },
      ],
    });
    if (!v) return;
    if (v === 'all') await payAll(S, list);
    else if (v === 'plan') await setPlan(S);
    else if (v[0] === 'd') await payOne(S, list[+v.slice(1)]);
    else if (v[0] === 'r') await askRepay(S, recv[+v.slice(1)]);
  }
}

async function payOne(S, d) {
  const full = payoffYen(S, d), have = spendable(S);
  const v = await modal({
    who: KIND[d.kind], title: esc(d.lender),
    html: `<div class="payslip">${debtRow(S, d)}</div><p>Số tiền muốn trả (¥): <input name="amt" type="number" min="1000" step="1000" value="${Math.min(full, Math.floor(have / 1000) * 1000)}" style="width:9em"></p>`,
    choices: [
      { label: `✅ Trả hết ngay · ${yen(full)}`, value: 'full', disabled: have < full, reason: `Thiếu ${yen(full - have)}` },
      { label: '💴 Trả số tiền đã nhập', value: 'part' },
      { label: '← Thôi', value: null, cancel: true },
    ],
  });
  if (!v) return;
  let amt = v === 'full' ? full : Math.floor(+formValues().amt || 0);
  if (!(amt > 0)) { toast('Nhập số tiền hợp lệ'); return; }
  amt = Math.min(amt, have, full);
  if (amt <= 0) { toast('Không đủ tiền'); return; }
  const before = d.status;
  const spent = payDebt(S, d, amt);
  sfx('coin');
  addLog(S, `Trả nợ ${d.lender}: ${yen(spent)}`);
  const done = before === 'active' && d.status === 'paid';
  const out = done ? applyFx(S, { mood: d.kind === 'home' ? 20 : 8, stress: -10 }) : [];
  await modal({ title: done ? '🎉 Đã trả hết khoản này!' : '✅ Đã trả', text: `Đã chi ${yen(spent)}. ${done ? (d.kind === 'home' ? 'Gia đình ở quê mừng rỡ — món nợ đi Nhật đã xong!' : d.kind === 'shark' ? 'Thoát khỏi vay nóng — từ giờ hết lo bị đe dọa.' : d.kind === 'bank' ? 'Trả trước hạn: miễn lãi các tháng sau, điểm tín dụng +15.' : 'Dư nợ thẻ về 0.') : `Còn lại: ${d.currency === 'VND' ? vnd(d.balance) : yen(d.balance)}.`}`, html: chips([['money', -spent], ...out]) });
}

async function payAll(S, list) {
  const ok = await modal({ title: '💸 Trả hết tất cả?', text: `Trả lần lượt từ khoản lãi cao nhất cho tới khi hết nợ hoặc hết tiền. Bạn đang có ${yen(spendable(S))}.`, choices: [{ label: 'Trả', value: true, primary: true }, { label: 'Thôi', value: false, cancel: true }] });
  if (!ok) return;
  let spent = 0; const cleared = [];
  for (const d of list) {
    const left = spendable(S);
    if (left <= 0) break;
    spent += payDebt(S, d, Math.min(left, payoffYen(S, d)));
    if (d.status === 'paid') cleared.push(d.lender);
  }
  sfx('coin');
  addLog(S, `Trả nợ: ${yen(spent)}`);
  const out = cleared.length ? applyFx(S, { mood: 6 * cleared.length, stress: -8 * cleared.length }) : [];
  await modal({ title: active(S).length ? '✅ Đã trả bớt' : '🎉 Sạch nợ!', text: `Đã chi ${yen(spent)}.${cleared.length ? `<br>Đã trả xong: ${cleared.map(esc).join(', ')}.` : ''}${active(S).length ? '<br>Vẫn còn nợ — trả tiếp khi có lương.' : '<br>Bạn không còn nợ ai nữa!'}`, html: chips([['money', -spent], ...out]) });
}

async function setPlan(S) {
  const v = await modal({ title: '🔁 Tự động trả nợ quê', text: 'Mỗi cuối tháng (Chủ Nhật), sau khi nhận lương, app tự chuyển số tiền này về trả nợ (có tính phí chuyển).', choices: [10000, 30000, 50000, 80000].map((a) => ({ label: yen(a), value: a })).concat([{ label: 'Tắt tự động', value: -1 }, { label: '← Thôi', value: null, cancel: true }]) });
  if (!v) return;
  S.fin.homePlan = v > 0 ? v : null;
  toast(v > 0 ? `🔁 Mỗi tháng gửi ${yen(v)} về trả nợ` : 'Đã tắt tự động');
}
// Gọi cuối tháng (sau lương)
export function homePlanMonthEnd(S, ctx) {
  const amt = S.fin.homePlan, d = S.fin.debts.find((x) => x.id === 'home' && x.status === 'active');
  if (!amt || !d) return;
  if (S.fin.bank < amt) { ctx.msgs.push(`⚠️ Tài khoản không đủ ${yen(amt)} để tự động gửi về trả nợ tháng này.`); return; }
  const spent = payDebt(S, d, amt);
  ctx.msgs.push(d.status === 'paid' ? `🎉 Tự động chuyển ${yen(spent)} — ĐÃ TRẢ HẾT NỢ Ở QUÊ!` : `🔁 Tự động chuyển ${yen(spent)} về trả nợ. Còn ${vnd(d.balance)}.`);
}

async function askRepay(S, r) {
  const d = PEOPLE[r.npc];
  r.asked = S.day;
  const ms = Math.min(1, d.traits.spd * 0.6 + (d.nat === 'vn' ? 0.3 : 0.1));
  const p = repayChance(d.traits, ms) * (S.day >= r.due ? 1 : 0.5);
  if (dayRoll(S, r.npc, 'askrepay') < p) {
    r.status = 'paid';
    earn(S, r.amount, 'loan', `${d.name} trả nợ`);
    gain(S, r.npc, 1);
    await modal({ who: `📱 ${d.name}`, title: '💸 Đã trả', text: `"Xin lỗi để bạn phải nhắc! Mình chuyển khoản ngay đây." — nhận lại ${yen(r.amount)}.`, html: chips([['money', r.amount]]) });
  } else {
    P(S, r.npc).aff = clamp(P(S, r.npc).aff - 1);
    await modal({ who: `📱 ${d.name}`, title: '⏳ Xin khất', text: `"Cho mình thêm ít hôm nữa nhé…" ${S.day < r.due ? '(Chưa tới hạn đã đòi, người ta hơi ngại.)' : ''}`, html: chips([['aff', -1]]) });
  }
}
