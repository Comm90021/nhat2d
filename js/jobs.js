// Nghề nghiệp (v3.3): thị trường việc làm, ứng tuyển, phỏng vấn, thử việc, thăng chức, nghỉ việc, thất nghiệp,
// chứng chỉ nghề, trường nghề. Ràng buộc theo tư cách lưu trú (đơn giản hóa từ quy định thực tế ⚠️).
import { yen, addLog, applyFx, clamp, jpLevel, bestCert, luckOf } from './state.js';
import { JOBS } from './data.js';
import { COMPANY } from './content/companies.js';
import { modal, chips, toast, esc } from './ui.js';
import { ask, pickWork } from './quiz.js';
import { INTERVIEW_Q, CERT_Q, WORK_Q2 } from './content/work2.js';
import { pay } from './finance.js';
import { setVisa, VISAS } from './career.js';
import { PEOPLE, AI_PLACES } from './ai/world.js';
import { atLeast } from './social.js';
import { levelIndex } from './learning.js';
import { sfx } from './audio.js';

const JP_IDX = { '': 0, N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
export const RANKS = ['Nhân viên', 'Tổ phó', 'Tổ trưởng (班長)', 'Chủ nhiệm (主任)', 'Trưởng bộ phận (係長)'];
export const FIELD_NAME = { food: 'Chế biến thực phẩm', agri: 'Nông nghiệp', construction: 'Xây dựng', manufacturing: 'Sản xuất công nghiệp', logistics: 'Kho vận', care: 'Điều dưỡng', restaurant: 'Nhà hàng', it: 'Công nghệ thông tin' };
const ORIG_FIELD = { factory: 'food', farm: 'agri', build: 'construction' };
const CERT_FIELD = { kaigo: 'care', gaishoku: 'restaurant' };
export const CERTS = {
  denki: { name: '第二種電気工事士 (thợ điện hạng 2)', fee: 9300, pass: 0.6 },
  fe: { name: '基本情報技術者 (kỹ sư CNTT cơ bản)', fee: 7500, pass: 0.6 },
  kaigo: { name: '介護技能評価試験 + 介護日本語 (điều dưỡng)', fee: 2000, pass: 0.6 },
  gaishoku: { name: '外食業特定技能測定試験 (nhà hàng)', fee: 10000, pass: 0.65 },
};

// Các vị trí tuyển dụng
export const ROLES = {
  bento: [{ id: 'bento_line', job: 'factory', title: 'Công nhân dây chuyền cơm hộp', field: 'food', pay: 185000, req: {} }],
  parts: [
    { id: 'parts_op', job: 'parts', title: 'Vận hành máy dập, robot hàn', field: 'manufacturing', pay: 195000, req: {} },
    { id: 'parts_qc', job: 'parts', title: 'Kiểm tra chất lượng (QC)', field: 'manufacturing', pay: 235000, req: { jp: 'N3', skill: 60 } },
  ],
  electric: [
    { id: 'ele_help', job: 'electric', title: 'Thợ điện phụ', field: 'manufacturing', pay: 210000, req: { jp: 'N4' } },
    { id: 'ele_tech', job: 'electric', title: 'Thợ điện (có 電気工事士)', field: 'manufacturing', pay: 265000, req: { jp: 'N3', cert: 'denki' } },
  ],
  logistics: [
    { id: 'log_staff', job: 'logistics', title: 'Nhân viên kho', field: 'logistics', pay: 200000, req: {} },
    { id: 'log_fork', job: 'logistics', title: 'Lái xe nâng', field: 'logistics', pay: 228000, req: { license: 'license_forklift' } },
  ],
  site: [{ id: 'site_worker', job: 'build', title: 'Công nhân xây dựng', field: 'construction', pay: 215000, req: {} }],
  care: [{ id: 'care_staff', job: 'care', title: 'Điều dưỡng viên', field: 'care', pay: 215000, req: { jp: 'N4', cert: 'kaigo' } }],
  ramen: [{ id: 'ramen_staff', job: 'restaurant', title: 'Nhân viên bếp & phục vụ', field: 'restaurant', pay: 190000, req: { jp: 'N4', cert: 'gaishoku' } }],
  it: [{ id: 'it_dev', job: 'it', title: 'Lập trình viên (kỹ sư)', field: 'it', pay: 280000, req: { jp: 'N2', diploma: 'it' } }],
};
const roleById = (id) => Object.entries(ROLES).flatMap(([co, list]) => list.map((r) => ({ ...r, co }))).find((r) => r.id === id);

// ---------- trạng thái việc làm ----------
export function ensureEmp(S) {
  if (!S.origJob) S.origJob = S.job;
  if (!S.emp) S.emp = { co: 'work', role: null, title: JOBS[S.origJob].name, pay: JOBS[S.origJob].monthly, rank: 0, since: 1, probation: 0, perf: [], lastPromo: 1, notice: null, unempSince: null };
  if (!S.career.field) S.career.field = ORIG_FIELD[S.origJob];
  if (!S.career.fields) S.career.fields = [];
  if (!S.school) S.school = null;
  return S.emp;
}
export const employed = (S) => !!(S.emp && S.emp.co);
export const myPlace = (S) => (S.emp && S.emp.co) || null;
export function workName(S) {
  if (!S.emp || S.emp.co === 'work') return JOBS[S.origJob || S.job].place;
  if (!S.emp.co) return 'chưa có việc';
  return coName(S.emp.co);
}
export const coName = (co) => (COMPANY[co] && COMPANY[co].name) || (AI_PLACES[co] && AI_PLACES[co].name) || co;
export const rankMul = (S) => 1 + 0.08 * ((S.emp && S.emp.rank) || 0);
export const monthlyPay = (S) => ((S.emp && S.emp.pay) || JOBS[S.job].monthly) * rankMul(S);
const hasCert = (S, id) => (S.certs || []).some((c) => c.type === 'cert' && c.id === id);

// Kiểm tra điều kiện ứng tuyển
export function eligibility(S, role) {
  const v = S.career.visa, why = [];
  if (S.emp && S.emp.co === role.co) why.push('Bạn đang làm ở đây rồi');
  if (v.startsWith('tts')) why.push('Thực tập sinh không được tự chuyển chỗ làm (chỉ trừ trường hợp đặc biệt như công ty phá sản, bị ngược đãi)');
  else if (v === 'ssw1' || v === 'ssw2') {
    if (role.field === 'it') why.push('Cần visa kỹ sư (技術・人文知識・国際業務), không làm theo Kỹ năng đặc định');
    else if (role.field !== S.career.field && !S.career.fields.includes(role.field)) why.push(`Visa KNĐĐ của bạn thuộc ngành "${FIELD_NAME[S.career.field]}". Muốn sang ngành "${FIELD_NAME[role.field]}" phải thi đỗ kỹ năng ngành đó`);
  } else if (v === 'eng' && role.field !== 'it') why.push('Visa kỹ sư chỉ cho làm công việc chuyên môn đúng ngành học');
  const q = role.req || {};
  if (q.jp && levelIndex(S.lang) < JP_IDX[q.jp]) why.push(`Cần tiếng Nhật ${q.jp} (hiện ${jpLevel(S)})`);
  if (q.cert && !hasCert(S, q.cert)) why.push(`Cần chứng chỉ ${CERTS[q.cert].name}`);
  if (q.license && !(S.fin.licenses || []).includes(q.license)) why.push('Cần chứng chỉ lái xe nâng (フォークリフト技能講習)');
  if (q.skill && ((S.skill && Object.values(S.skill).reduce((a, b) => Math.max(a, b), 0)) || 0) < q.skill) why.push(`Cần tay nghề ≥ ${q.skill} điểm`);
  if (q.diploma && !(S.school && S.school.done)) why.push('Cần bằng trường nghề (専門士) ngành IT');
  return why;
}
const referral = (S, co) => Object.keys(PEOPLE).find((id) => PEOPLE[id].job && PEOPLE[id].job.place === co && atLeast(S, id, 3));

// ---------- app việc làm ----------
export async function openJobs(S) {
  ensureEmp(S);
  for (;;) {
    const all = Object.entries(ROLES).flatMap(([co, list]) => list.map((r) => ({ ...r, co })));
    const status = `<div class="payslip"><div class="prow"><span>Chỗ làm hiện tại</span><span>${esc(workName(S))}</span></div>${employed(S) ? `<div class="prow"><span>Chức vụ</span><span>${esc(S.emp.title)} · ${RANKS[S.emp.rank]}</span></div><div class="prow"><span>Lương gộp</span><span>${yen(monthlyPay(S))}/tháng</span></div>${S.emp.probation > S.day ? `<div class="prow"><span>Thử việc</span><span>còn ${S.emp.probation - S.day} ngày</span></div>` : ''}${S.emp.notice ? `<div class="prow neg"><span>Đã báo nghỉ</span><span>ngày ${S.emp.notice}</span></div>` : ''}` : `<div class="prow neg"><span>Thất nghiệp</span><span>từ ngày ${S.emp.unempSince}</span></div>`}<div class="prow"><span>Visa</span><span>${esc(VISAS[S.career.visa].short)} · ngành ${esc(FIELD_NAME[S.career.field] || '-')}</span></div></div>`;
    const v = await modal({
      who: '💼 Việc làm', title: 'Tìm việc & sự nghiệp', wide: true, html: status,
      choices: [
        ...all.map((r) => {
          const why = eligibility(S, r);
          const ref = referral(S, r.co);
          return { label: `${coName(r.co)} — ${r.title}`, sub: `${yen(r.pay)}/tháng · ${FIELD_NAME[r.field]}${ref ? ` · 🤝 ${esc(PEOPLE[ref].name)} có thể giới thiệu` : ''}${why.length ? `<br>⛔ ${esc(why[0])}` : ''}`, value: 'r:' + r.id, disabled: !!why.length && why[0] === 'Bạn đang làm ở đây rồi', reason: '' };
        }),
        { label: '📝 Thi chứng chỉ nghề', value: 'cert' },
        ...(employed(S) && !S.emp.notice ? [{ label: '🚪 Báo nghỉ việc (trước 1 tháng)', value: 'quit' }] : []),
        { label: '← Đóng', value: null, cancel: true },
      ],
    });
    if (!v) return;
    if (v === 'cert') { await certMenu(S); continue; }
    if (v === 'quit') { await quitFlow(S); continue; }
    const role = roleById(v.slice(2));
    const why = eligibility(S, role);
    if (why.length) { await modal({ title: 'Chưa đủ điều kiện', text: why.map((w) => '• ' + esc(w)).join('<br>') }); continue; }
    await interview(S, role);
    return;
  }
}

async function interview(S, role) {
  const C = COMPANY[role.co] || { name: coName(role.co), jp: '' };
  const ref = referral(S, role.co);
  await modal({ who: `面接 · ${C.jp}`, title: `🧑‍💼 Phỏng vấn: ${C.name}`, text: `Vị trí <b>${esc(role.title)}</b>. Phỏng vấn gồm 3 câu về phép lịch sự / kính ngữ và 2 câu chuyên môn.${ref ? `<br>🤝 ${esc(PEOPLE[ref].name)} đã giới thiệu bạn — điểm cộng lớn.` : ''}${(S.fin.assets || []).some((a) => a.id === 'interview_suit') ? '<br>👔 Bạn mặc bộ vest phỏng vấn — ấn tượng tốt.' : ''}`, ok: 'Gõ cửa 3 lần: 「失礼します」' });
  let ok = 0;
  const qs = [...[...INTERVIEW_Q].sort(() => Math.random() - 0.5).slice(0, 3)];
  for (let i = 0; i < 3; i++) { const q = qs[i]; const o = [0, 1, 2, 3].sort(() => Math.random() - 0.5); if (await ask({ ...q, opts: o.map((k) => q.opts[k]), a: o.indexOf(0) }, { who: `Phỏng vấn · Câu ${i + 1}/5`, feedback: 'none' })) ok++; }
  for (let i = 0; i < 2; i++) { const q = pickWork(S, role.job); if (await ask(q, { who: `Phỏng vấn · Câu ${i + 4}/5`, feedback: 'none' })) ok++; }
  const jpBonus = (levelIndex(S.lang) - JP_IDX[(role.req && role.req.jp) || ''] ) * 0.05;
  const score = ok / 5 * 0.75 + (ref ? 0.2 : 0) + ((S.fin.assets || []).some((a) => a.id === 'interview_suit') ? 0.07 : 0) + Math.max(0, jpBonus) + (S.rep - 50) / 400 + ((S.attr ? S.attr.soc : 25) - 30) / 400 + ((S.attr ? S.attr.look : 30) - 30) / 600 + (luckOf(S) - 50) / 800;
  S.time += 120;
  if (score < 0.6) { sfx('bad'); await modal({ who: C.name, title: '📩 Kết quả phỏng vấn', jp: '不採用', text: `Cảm ơn bạn đã ứng tuyển. Lần này công ty chưa thể tuyển bạn. (Trả lời đúng ${ok}/5)<br><span class="dim">Luyện kính ngữ, chuẩn bị 志望動機, có người giới thiệu sẽ dễ hơn.</span>` }); return; }
  sfx('end');
  const needVisa = role.field === 'it' && S.career.visa !== 'eng' && !['spouse', 'pr'].includes(S.career.visa);
  const fieldChange = ['ssw1', 'ssw2'].includes(S.career.visa) && role.field !== S.career.field;
  const acc = await modal({ who: C.name, title: '🎉 Trúng tuyển!', jp: '採用', text: `Công ty mời bạn làm <b>${esc(role.title)}</b>, lương gộp <b>${yen(role.pay)}</b>/tháng, thử việc 3 tháng.${needVisa ? '<br>Công ty sẽ bảo lãnh đổi sang <b>visa kỹ sư (技術・人文知識・国際業務)</b> — visa này được bảo lãnh vợ/chồng, con sang Nhật.' : ''}${['ssw1', 'ssw2'].includes(S.career.visa) ? '<br>Phải nộp hồ sơ đổi tư cách lưu trú (在留資格変更) — lệ phí ¥4,000.' : ''}<br>Nhận việc thì phải báo nghỉ ở chỗ cũ.`, choices: [{ label: '✍️ Nhận việc', value: true, primary: true }, { label: 'Từ chối', value: false }] });
  if (!acc) return;
  if (['ssw1', 'ssw2', 'eng'].includes(S.career.visa) || needVisa) pay(S, 4000, 'other', 'Lệ phí đổi tư cách lưu trú');
  if (needVisa) setVisa(S, 'eng', 3);
  if (fieldChange) S.career.field = role.field;
  S.emp = { co: role.co, role: role.id, title: role.title, pay: role.pay, rank: 0, since: S.day, probation: S.day + 21, perf: [], lastPromo: S.day, notice: null, unempSince: null };
  S.job = role.job;
  addLog(S, `Nhận việc: ${role.title} ở ${C.name}`);
  await modal({ title: '💼 Bắt đầu công việc mới', text: `Từ mai đến <b>${esc(C.name)}</b> làm việc${C.name.includes('Minato') || ['bento', 'it', 'electric', 'parts', 'logistics', 'site'].includes(role.co) ? ' (khu công nghiệp Minato — đi tàu từ ga Hikari)' : ''}. Vào công ty, bấm vào vị trí làm việc để vào ca.` });
}

async function quitFlow(S) {
  const v = await modal({ title: '🚪 Nghỉ việc', text: 'Ở Nhật nên báo nghỉ trước ít nhất 1 tháng (luật cho phép 2 tuần với hợp đồng không thời hạn). Nghỉ ngang sẽ mất uy tín, khó xin việc mới.', choices: [{ label: 'Báo nghỉ, làm hết tháng', value: 'notice' }, { label: 'Nghỉ ngay', value: 'now' }, { label: 'Thôi', value: null, cancel: true }] });
  if (!v) return;
  if (v === 'notice') { S.emp.notice = S.day + 7; addLog(S, 'Báo nghỉ việc'); toast('Đã báo nghỉ — làm đến hết tháng'); return; }
  applyFx(S, { rep: -15 });
  endEmployment(S, 'Nghỉ việc ngang');
}
export function endEmployment(S, why) {
  addLog(S, `${why}: rời ${workName(S)}`);
  S.emp = { co: null, role: null, title: 'Thất nghiệp', pay: 0, rank: 0, since: S.day, probation: 0, perf: [], lastPromo: S.day, notice: null, unempSince: S.day };
}

// ---------- thi chứng chỉ nghề ----------
async function certMenu(S) {
  const v = await modal({ who: '資格', title: '📝 Thi chứng chỉ nghề', text: 'Mỗi tháng thi được một lần. Đề gồm 10 câu.', choices: [
    ...Object.entries(CERTS).map(([id, c]) => ({ label: `${hasCert(S, id) ? '✅ ' : ''}${c.name} · ${yen(c.fee)}`, value: id, disabled: hasCert(S, id) || S.money < c.fee || (S.certTried && S.certTried[id] && S.day - S.certTried[id] < 7), reason: hasCert(S, id) ? 'Đã có' : S.money < c.fee ? 'Không đủ tiền' : 'Tháng này đã thi' })),
    { label: '🚜 Khóa học lái xe nâng (フォークリフト技能講習) · ¥42,000', value: 'fork', disabled: (S.fin.licenses || []).includes('license_forklift') || S.money < 42000, reason: 'Đã có / không đủ tiền' },
    { label: '← Quay lại', value: null, cancel: true },
  ] });
  if (!v) return;
  if (v === 'fork') { pay(S, 42000, 'study', 'Khóa học xe nâng'); S.fin.licenses.push('license_forklift'); S.time += 240; await modal({ title: '🚜 Có chứng chỉ xe nâng', text: 'Học 4 ngày (lý thuyết + thực hành), thi đạt. Ở Nhật, lái xe nâng từ 1 tấn trở lên bắt buộc có 技能講習.' }); return; }
  const c = CERTS[v];
  pay(S, c.fee, 'study', `Lệ phí thi ${c.name}`);
  S.certTried = S.certTried || {}; S.certTried[v] = S.day;
  const qs = [...CERT_Q[v]].sort(() => Math.random() - 0.5).slice(0, 10);
  let ok = 0;
  // trí tuệ cao: đôi khi loại được một đáp án sai nhờ suy luận
  const intel = S.attr ? S.attr.int : 25;
  for (let i = 0; i < qs.length; i++) { const q = qs[i]; const o = [0, 1, 2, 3].sort(() => Math.random() - 0.5); const a = o.indexOf(0); const hide = Math.random() < intel / 220 ? [[0, 1, 2, 3].find((k) => k !== a)] : []; if (await ask({ ...q, opts: o.map((k) => q.opts[k]), a }, { who: `${c.name} · Câu ${i + 1}/${qs.length}`, feedback: 'none', hide })) ok++; }
  S.time += 180;
  if (ok / qs.length >= c.pass) {
    S.certs.push({ type: 'cert', id: v, lv: c.name, day: S.day });
    if (CERT_FIELD[v] && !S.career.fields.includes(CERT_FIELD[v])) S.career.fields.push(CERT_FIELD[v]);
    addLog(S, `Đỗ ${c.name}`); sfx('end');
    await modal({ title: `🎉 Đỗ ${c.name}!`, text: `Đúng ${ok}/${qs.length}. Chứng chỉ mở ra vị trí lương cao hơn${CERT_FIELD[v] ? ` và cho phép chuyển sang ngành ${FIELD_NAME[CERT_FIELD[v]]} (visa Kỹ năng đặc định)` : ''}.` });
  } else { sfx('bad'); await modal({ title: 'Chưa đỗ', text: `Đúng ${ok}/${qs.length}. Ôn thêm rồi tháng sau thi lại.` }); }
}

// ---------- trường nghề IT buổi tối ----------
export const SCHOOL = { fee: 45000, sessions: 80 };
export function schoolActions(S) {
  const s = S.school;
  if (!s) return [{ label: '🎓 Ghi danh trường nghề IT buổi tối (夜間専門学校)', sub: `${yen(SCHOOL.fee)}/tháng · ${SCHOOL.sessions} buổi + JLPT N3 → bằng 専門士, mở đường visa kỹ sư`, run: async (S2) => { S2.school = { start: S2.day, sessions: 0, done: false }; addLog(S2, 'Ghi danh trường nghề IT'); toast('🎓 Đã ghi danh — học tối thứ Hai–Sáu ở đây'); } }];
  if (s.done) return [];
  return [{ label: `🎓 Lên lớp trường nghề (${s.sessions}/${SCHOOL.sessions} buổi)`, sub: '3 câu tin học · 120 phút', minutes: 120, energy: 12, cond: (S2) => (S2.today.school ? 'Hôm nay đã học' : S2.time < 18 * 60 || S2.time >= 21 * 60 ? 'Lớp học 18:00–21:00' : null), run: async (S2) => {
    S2.today.school = true;
    let ok = 0;
    for (let i = 0; i < 3; i++) { const q = [...CERT_Q.fe][Math.floor(Math.random() * CERT_Q.fe.length)]; const o = [0, 1, 2, 3].sort(() => Math.random() - 0.5); if (await ask({ ...q, opts: o.map((k) => q.opts[k]), a: o.indexOf(0) }, { who: `Trường nghề · Câu ${i + 1}/3` })) ok++; }
    S2.school.sessions += ok >= 2 ? 1 : 0.5;
    S2.time += 120; applyFx(S2, { energy: -12 });
    if (S2.school.sessions >= SCHOOL.sessions && levelIndex(S2.lang) >= 3) { S2.school.done = true; sfx('end'); addLog(S2, 'Tốt nghiệp trường nghề IT (専門士)'); await modal({ title: '🎓 Tốt nghiệp!', text: 'Bạn nhận bằng 専門士 ngành IT. Giờ có thể ứng tuyển lập trình viên và xin visa kỹ sư.' }); }
    else toast(`🎓 Buổi học ${ok >= 2 ? 'tốt' : 'chưa hiểu lắm (tính nửa buổi)'} · ${Math.floor(S2.school.sessions)}/${SCHOOL.sessions}`);
  } }];
}

// ---------- cuối tháng: thử việc, thăng chức, nghỉ việc, thất nghiệp ----------
export function jobsMonthEnd(S, ctx) {
  ensureEmp(S);
  const E = S.emp;
  if (S.school && !S.school.done) pay(S, SCHOOL.fee, 'study', 'Học phí trường nghề IT');
  if (!E.co) {
    const days = S.day - (E.unempSince || S.day);
    if (!S.career.visa.startsWith('tts') && !['spouse', 'pr'].includes(S.career.visa)) {
      if (days >= 21) { ctx.endKind = 'visa'; ctx.unemployedOut = true; return; }
      ctx.msgs.push(`⚠️ Bạn đã thất nghiệp ${days} ngày. Visa lao động có thể bị hủy nếu không làm việc quá 3 tháng (${21 - days} ngày nữa). Mở 📱 → Việc làm.`);
    }
    return;
  }
  if (E.notice && S.day >= E.notice) { endEmployment(S, 'Nghỉ việc theo báo trước'); ctx.msgs.push('📦 Hôm nay là ngày cuối ở chỗ làm cũ. Bạn đang tìm việc mới.'); return; }
  const avg = E.perf.length ? E.perf.reduce((a, b) => a + b, 0) / E.perf.length : 0.6;
  if (E.probation && S.day >= E.probation) {
    E.probation = 0;
    if (avg < 0.45) { endEmployment(S, 'Không qua thử việc'); ctx.msgs.push('📩 Công ty không ký hợp đồng chính thức sau thử việc (đánh giá công việc thấp). Bạn đang thất nghiệp.'); return; }
    ctx.msgs.push('📄 Bạn đã qua thử việc, ký hợp đồng chính thức!');
  }
  if (E.rank < RANKS.length - 1 && S.day - E.lastPromo >= 42 && avg >= 0.75 && S.rep >= 65 && levelIndex(S.lang) >= Math.min(3, E.rank + 2) && E.perf.length >= 8) {
    E.rank++; E.lastPromo = S.day;
    addLog(S, `Thăng chức: ${RANKS[E.rank]}`);
    ctx.msgs.push(`🎉 Bạn được thăng chức <b>${RANKS[E.rank]}</b>! Lương tăng 8%.`);
  }
  E.perf = E.perf.slice(-15);
}
export function recordShift(S, score) { ensureEmp(S); S.emp.perf.push(score); }
