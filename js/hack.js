// 🛠️ Chế độ hack (mở bằng mật khẩu trong menu ⏸): sửa chỉ số, quan hệ NPC (có khóa cứng), thời gian, visa,
// chứng chỉ, dịch chuyển tức thời. Khi bật, mọi lựa chọn hiện ⭐ đáp án tốt nhất và % xác suất.
// Mật khẩu chỉ lưu dạng mã băm SHA-256 (game chạy trên trình duyệt nên đây chỉ là rào chắn cho người chơi thường).
import { G, STAT_INFO, ATTR_KEYS, ensureAttr, clamp, clockStr, MIDNIGHT, yen, vnd, addLog } from './state.js';
import { modal, toast, esc, formValues } from './ui.js';
import { hackOn } from './hackflag.js';
import { PEOPLE } from './ai/world.js';
import { ids, resetCache, stateOf } from './ai/sim.js';
import { hashStr } from './ai/rules.js';
import { P } from './social.js';
import { VISAS, setVisa } from './career.js';
import { CERTS } from './jobs.js';
import { grantLevel } from './learning.js';
import { openMap } from './mapview.js';
import { curMap } from './world/scene.js';
import { romanceGate } from './dating.js';

const PASS_SHA = 'fc0fac15876254f535bb7c3f17bcd0aaf963f246d6144277e1265ecaa4a42526';
const PASS_FNV = 654497914; // dự phòng khi trình duyệt không có crypto.subtle (trang http thường)

async function checkPass(pw) {
  try {
    if (globalThis.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('') === PASS_SHA;
    }
  } catch (e) { /* rơi xuống dự phòng */ }
  return hashStr(pw) === PASS_FNV;
}

// Khóa cứng: giữ nguyên giá trị (gọi định kỳ trong vòng lặp và sau mỗi ngày mới)
export function enforceLocks(S) {
  if (!hackOn(S) || !S.hack.locks) return;
  const L = S.hack.locks;
  for (const [k, v] of Object.entries(L.stat || {})) setStat(S, k, v);
  for (const [id, o] of Object.entries(L.npc || {})) {
    const p = P(S, id);
    if (o.aff != null) p.aff = o.aff;
    if (o.att != null) p.att = o.att;
  }
}

const STAT_KEYS = ['cash', 'bank', 'health', 'energy', 'full', 'mood', 'rep', ...ATTR_KEYS, 'skill', 'credit', 'homeDebt'];
const LABEL = { cash: '👛 Tiền mặt (¥)', bank: '🏧 Tài khoản (¥)', skill: '🛠️ Tay nghề (điểm)', credit: '💳 Điểm tín dụng (300–850)', homeDebt: '🏡 Nợ ở quê (₫)' };
function getStat(S, k) {
  if (k === 'cash') return S.fin.cash;
  if (k === 'bank') return S.fin.bank;
  if (k === 'skill') return (S.skill && S.skill[S.job]) || 0;
  if (k === 'credit') return S.fin.credit || 600;
  if (k === 'homeDebt') return Math.max(0, S.debt);
  if (ATTR_KEYS.includes(k)) return ensureAttr(S)[k];
  return S[k];
}
function setStat(S, k, v) {
  v = Number(v);
  if (!Number.isFinite(v)) return;
  if (k === 'cash') S.fin.cash = Math.round(v);
  else if (k === 'bank') S.fin.bank = Math.max(0, Math.round(v));
  else if (k === 'skill') { S.skill = S.skill || {}; S.skill[S.job] = Math.max(0, Math.round(v)); }
  else if (k === 'credit') S.fin.credit = Math.max(300, Math.min(850, Math.round(v)));
  else if (k === 'homeDebt') { const h = S.fin.debts.find((x) => x.id === 'home'); if (h) { h.balance = Math.max(0, Math.round(v)); h.status = h.balance > 0 ? 'active' : 'paid'; } }
  else if (ATTR_KEYS.includes(k)) ensureAttr(S)[k] = clamp(v);
  else S[k] = clamp(v);
}

export async function openHack(S) {
  if (!hackOn(S)) {
    const ok = await modal({
      title: '🛠️ Chế độ hack', text: 'Nhập mật khẩu để mở khóa. Bật hack sẽ ghi dấu vào save này.',
      html: '<p><input name="pw" type="password" autocomplete="off" style="width:14em" placeholder="mật khẩu"></p>',
      choices: [{ label: '🔓 Mở khóa', value: true, primary: true }, { label: 'Thôi', value: false, cancel: true }],
    });
    if (!ok) return;
    if (!(await checkPass(String(formValues().pw || '')))) { toast('❌ Sai mật khẩu'); return; }
    S.hack = { on: true, locks: { stat: {}, npc: {} }, since: S.day };
    addLog(S, '🛠️ Bật chế độ hack');
    toast('🛠️ Đã bật chế độ hack');
  }
  for (;;) {
    const L = S.hack.locks, nLock = Object.keys(L.stat).length + Object.keys(L.npc).length;
    const v = await modal({
      who: '🛠️ Chế độ hack', title: 'Bảng điều khiển',
      text: 'Mọi lựa chọn trong game đang hiện ⭐ đáp án tốt nhất và % xác suất thành công.',
      choices: [
        { label: '📊 Chỉ số nhân vật', sub: 'Tiền, sức khỏe, chỉ số phụ, may mắn, tay nghề, tín dụng · khóa cứng', value: 'stat' },
        { label: '💞 Quan hệ NPC', sub: 'Thân thiết, rung động, khóa cứng, gọi tới, ly hôn', value: 'npc' },
        { label: '⏰ Thời gian & visa', sub: 'Nhảy giờ / ngày, đổi visa, thêm chứng chỉ', value: 'time' },
        { label: '🌀 Dịch chuyển tức thời', sub: 'Mở bản đồ → chọn nơi → 🛠️ Dịch chuyển', value: 'tp' },
        { label: `🔒 Gỡ mọi khóa cứng (${nLock})`, value: 'unlock', disabled: !nLock, reason: 'Chưa khóa gì' },
        { label: '🚫 Tắt chế độ hack', value: 'off' },
        { label: '← Đóng', value: null, cancel: true },
      ],
    });
    if (!v) return;
    if (v === 'stat') await statTab(S);
    if (v === 'npc') await npcTab(S);
    if (v === 'time') await timeTab(S);
    if (v === 'tp') { await openMap(S); return; }
    if (v === 'unlock') { S.hack.locks = { stat: {}, npc: {} }; toast('🔓 Đã gỡ mọi khóa'); }
    if (v === 'off') { S.hack.on = false; toast('Đã tắt chế độ hack'); return; }
  }
}

const num = (name, val, step = 1) => `<input name="${name}" type="number" step="${step}" value="${Math.round(val * 10) / 10}" style="width:8em">`;
const chk = (name, on) => `<label class="dim"><input name="${name}" type="checkbox"${on ? ' checked' : ''}> 🔒</label>`;

async function statTab(S) {
  const L = S.hack.locks.stat;
  const rows = STAT_KEYS.map((k) => {
    const lab = LABEL[k] || `${STAT_INFO[k].icon} ${STAT_INFO[k].label}`;
    return `<div class="prow"><span>${lab}</span><span>${num(k, getStat(S, k))} ${chk('lock_' + k, k in L)}</span></div>`;
  }).join('');
  const v = await modal({
    who: '🛠️ Hack', title: '📊 Chỉ số', wide: true,
    html: `<div class="payslip">${rows}</div><p class="dim">🔒 = khóa cứng: giá trị giữ nguyên dù ăn, ngủ, làm việc hay qua ngày.</p>`,
    choices: [{ label: '✅ Áp dụng', value: true, primary: true }, { label: '← Quay lại', value: false, cancel: true }],
  });
  if (!v) return;
  const f = formValues();
  for (const k of STAT_KEYS) {
    if (f[k] !== '' && f[k] != null) setStat(S, k, f[k]);
    if (f['lock_' + k]) L[k] = getStat(S, k); else delete L[k];
  }
  toast('✅ Đã áp dụng');
}

async function npcTab(S) {
  let all = false;
  for (;;) {
    const list = ids().filter((id) => all || (S.npc[id] && S.npc[id].met) || PEOPLE[id].core)
      .sort((a, b) => ((S.npc[b] && S.npc[b].aff) || 0) - ((S.npc[a] && S.npc[a].aff) || 0));
    const id = await modal({
      who: '🛠️ Hack', title: '💞 Chọn người',
      choices: [
        ...list.map((x) => { const p = S.npc[x] || {}, lk = S.hack.locks.npc[x]; return { label: `${PEOPLE[x].name}${lk ? ' 🔒' : ''}`, sub: `${esc(PEOPLE[x].role)} · 💞${Math.round(p.aff || 0)} · 💗${Math.round(p.att || 0)}${p.met ? '' : ' · chưa quen'}`, value: x }; }),
        { label: all ? '👥 Chỉ người quen + nhân vật chính' : '👥 Hiện tất cả mọi người', value: '__all' },
        { label: '← Quay lại', value: null, cancel: true },
      ],
    });
    if (!id) return;
    if (id === '__all') { all = !all; continue; }
    await npcEdit(S, id);
  }
}

// nơi người chơi đang đứng, quy ra địa điểm AI (để gọi NPC tới)
function herePlace(S) {
  const M = curMap(S);
  if (!M.outdoor) return M.key && M.key.startsWith('unit:') ? 'u:' + M.key.slice(5) : M.key;
  const sp = (M.spots || []).map((s) => ({ s, d: Math.hypot(S.pos.x - s.tx * 16, S.pos.y - s.ty * 16) })).sort((a, b) => a.d - b.d)[0];
  return sp && sp.d < 160 ? sp.s.id : null;
}

async function npcEdit(S, id) {
  const d = PEOPLE[id], p = P(S, id), lk = S.hack.locks.npc;
  const g = romanceGate(S, id);
  const v = await modal({
    who: `🛠️ ${d.role}`, title: d.name,
    html: `<div class="payslip">
      <div class="prow"><span>💞 Thân thiết</span><span>${num('aff', p.aff || 0)}</span></div>
      <div class="prow"><span>💗 Rung động</span><span>${num('att', p.att || 0)}</span></div>
      <div class="prow"><span>Đã quen</span><span><input name="met" type="checkbox"${p.met ? ' checked' : ''}></span></div>
      <div class="prow"><span>🔒 Khóa cứng thân thiết + rung động</span><span><input name="lock" type="checkbox"${lk[id] ? ' checked' : ''}></span></div>
    </div><p class="dim">Đang ${esc((stateOf(S, id).act))} · ${g.ok ? (g.affair ? '⚠️ đã có gia đình (tuyến bí mật)' : '💗 có thể yêu') : esc(g.reason || 'không thể yêu')}</p>`,
    choices: [
      { label: '✅ Áp dụng', value: 'apply', primary: true },
      { label: '📍 Gọi tới chỗ tôi (3 tiếng)', value: 'call' },
      ...(d.married && d.household && d.household.married ? [{ label: '💔 Cho ly hôn ngay', sub: 'Tách hộ, vợ/chồng chuyển đi', value: 'div' }] : []),
      { label: '← Quay lại', value: null, cancel: true },
    ],
  });
  if (!v) return;
  const f = formValues();
  if (v === 'apply') {
    p.aff = clamp(+f.aff || 0); p.att = clamp(+f.att || 0); p.met = !!f.met;
    if (p.met && !p.last) p.last = S.day;
    if (f.lock) lk[id] = { aff: p.aff, att: p.att }; else delete lk[id];
    toast(`✅ ${d.name}: 💞${p.aff} 💗${p.att}${f.lock ? ' 🔒' : ''}`);
  }
  if (v === 'call') {
    const place = herePlace(S);
    if (!place) { toast('Hãy vào một tòa nhà hoặc đứng gần một địa điểm trước'); return; }
    const h = Math.floor(S.time / 60);
    S.world.override = S.world.override || {};
    S.world.override[id] = { day: S.day, from: h, to: Math.min(24, h + 3), act: 'social', place };
    resetCache();
    toast(`📍 ${d.name} đang tới chỗ bạn`);
  }
  if (v === 'div') {
    const { splitHousehold } = await import('./homes.js');
    splitHousehold(S, id);
    if (S.affairs && S.affairs[id]) { delete S.affairs[id]; if (!S.love) S.love = { id, stage: 'dating', since: S.day, lastDate: S.day, touch: 2 }; }
    resetCache();
    toast(`💔 ${d.name} đã ly hôn`);
  }
}

async function timeTab(S) {
  const v = await modal({
    who: '🛠️ Hack', title: '⏰ Thời gian & visa', wide: true,
    html: `<div class="payslip">
      <div class="prow"><span>🕐 Giờ hôm nay (0–23, hiện ${clockStr(S.time)})</span><span>${num('hour', Math.floor(S.time / 60))}</span></div>
      <div class="prow"><span>📅 Ngày (hiện ${S.day})</span><span>${num('day', S.day)}</span></div>
      <div class="prow"><span>🛂 Visa</span><span><select name="visa">${Object.entries(VISAS).map(([k, x]) => `<option value="${k}"${k === S.career.visa ? ' selected' : ''}>${esc(x.short)}</option>`).join('')}</select> ${num('years', 3)} năm</span></div>
      <div class="prow"><span>🗣️ Thêm chứng chỉ JLPT</span><span><select name="jlpt"><option value="">—</option>${['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => `<option>${l}</option>`).join('')}</select></span></div>
      <div class="prow"><span>📜 Thêm chứng chỉ nghề</span><span><select name="cert"><option value="">—</option>${Object.entries(CERTS).map(([k, c]) => `<option value="${k}">${esc(c.name)}</option>`).join('')}</select></span></div>
    </div><p class="dim">Nhảy ngày sẽ bỏ qua các sự kiện ở giữa (lương, gia đình…). Muốn sự kiện vẫn chạy thì dùng ⏩ Chờ và đi ngủ bình thường.</p>`,
    choices: [
      { label: '🕐 Đặt giờ', value: 'hour' },
      { label: '📅 Nhảy tới ngày', value: 'day' },
      { label: '🛂 Đổi visa', value: 'visa' },
      { label: '📜 Thêm chứng chỉ đã chọn', value: 'cert' },
      { label: '← Quay lại', value: null, cancel: true },
    ],
  });
  if (!v) return;
  const f = formValues();
  if (v === 'hour') { const h = Math.max(0, Math.min(23, Math.floor(+f.hour))); S.time = Math.min(MIDNIGHT - 5, h * 60); resetCache(); toast(`🕐 ${clockStr(S.time)}`); }
  if (v === 'day') { const n = Math.max(1, Math.floor(+f.day)); S.day = n; S.time = 6 * 60 + 30; S.today = {}; resetCache(); toast(`📅 Ngày ${n}`); }
  if (v === 'visa') { setVisa(S, f.visa, Math.max(0, +f.years || 1)); toast(`🛂 ${VISAS[f.visa].short}`); }
  if (v === 'cert') {
    if (f.jlpt) { if (!S.certs.some((c) => c.type === 'JLPT' && c.lv === f.jlpt)) S.certs.push({ type: 'JLPT', lv: f.jlpt, day: S.day }); grantLevel(S.lang, f.jlpt); toast(`📜 JLPT ${f.jlpt}`); }
    if (f.cert && CERTS[f.cert] && !S.certs.some((c) => c.type === 'cert' && c.id === f.cert)) { S.certs.push({ type: 'cert', id: f.cert, lv: CERTS[f.cert].name, day: S.day }); toast(`📜 ${CERTS[f.cert].name}`); }
  }
}

// cho phép kiểm thử
export const _test = { checkPass };
export { G };
