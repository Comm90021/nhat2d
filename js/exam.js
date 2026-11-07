// Thi JLPT: đăng ký → thi → chờ kết quả. Mỗi năm 2 kỳ (tháng 7 và tháng 12).
import { doy, year, monthOf, yen, addLog, bestCert } from './state.js';
import { LEVELS, levelLabel, questionsOfLevel, shuffleQ, answer, targetLevel, grantLevel } from './learning.js';
import { KIND } from './content/jlpt.js';
import { modal, chips, esc } from './ui.js';
import { ask } from './quiz.js';
import { sfx } from './audio.js';
import { pay } from './finance.js';

export const FEE = 7500;
export const SESSIONS = [
  { id: 'jul', name: 'tháng 7', regFrom: 1, regTo: 14, exam: 28, result: 35 },
  { id: 'dec', name: 'tháng 12', regFrom: 29, regTo: 42, exam: 63, result: 77 },
];
const N_Q = 15;

export function openSession(S) {
  const d = doy(S);
  return SESSIONS.find((s) => d >= s.regFrom && d <= s.regTo) || null;
}
export function canRegister(S) {
  const s = openSession(S);
  if (!s) return null;
  if (S.exam && S.exam.year === year(S) && S.exam.sess === s.id) return null;
  return s;
}
export function nextSessionText(S) {
  const d = doy(S);
  const s = SESSIONS.find((x) => d <= x.regTo) || SESSIONS[0];
  const inThisYear = d <= s.regTo;
  return `Kỳ ${s.name}: đăng ký từ tháng ${monthOf(s.regFrom)} đến hết tháng ${monthOf(s.regTo)}${inThisYear ? '' : ' (năm sau)'}`;
}

export async function register(S) {
  const s = canRegister(S);
  if (!s) { await modal({ title: 'Chưa mở đăng ký', text: nextSessionText(S) }); return; }
  const rec = targetLevel(S.lang);
  const cert = bestCert(S);
  const lv = await modal({
    who: 'MyJLPT · đăng ký qua mạng', title: `📝 Đăng ký thi JLPT kỳ ${s.name}`,
    text: `Lệ phí ${yen(FEE)}. Trình độ hiện tại: <b>${levelLabel(S.lang)}</b>${cert ? ` · chứng chỉ cao nhất: <b>${cert}</b>` : ''}.<br>Bài thi gồm ${N_Q} câu ở đúng cấp bạn chọn. Đỗ khi đúng từ 60% trở lên và không phần nào quá thấp.`,
    choices: [
      ...LEVELS.map((l) => ({ label: `Cấp ${l}${l === rec ? ' ← đang học' : ''}`, value: l, disabled: S.money < FEE, reason: 'Không đủ tiền' })),
      { label: 'Để sau', value: null, cancel: true },
    ],
  });
  if (!lv) return;
  pay(S, FEE, 'study', `Lệ phí thi JLPT ${lv}`);
  S.exam = { lv, year: year(S), sess: s.id, taken: false, score: null, pass: null };
  addLog(S, `Đăng ký thi JLPT ${lv} kỳ ${s.name}`);
  sfx('coin');
  await modal({ title: '✅ Đã đăng ký', text: `Bạn đăng ký thi <b>${lv}</b>. Ngày thi: tháng ${monthOf(s.exam)} (ngày ${s.exam} trong năm). Phiếu dự thi sẽ được gửi về ký túc xá.`, html: chips([['money', -FEE]]) });
}

// Gọi vào buổi sáng mỗi ngày. Trả về true nếu có xử lý.
export async function examMorning(S) {
  const E = S.exam;
  if (!E || E.year !== year(S)) return false;
  const s = SESSIONS.find((x) => x.id === E.sess);
  if (!E.taken && doy(S) === s.exam) { await takeExam(S, s); return true; }
  if (E.taken && E.pass === null && doy(S) >= s.result) { await announce(S); return true; }
  return false;
}

async function takeExam(S, s) {
  const E = S.exam;
  S.today.noWork = true;
  await modal({
    who: `Kỳ thi JLPT ${s.name}`, title: `📝 Hôm nay thi ${E.lv}`, jp: '日本語能力試験',
    text: 'Công ty cho bạn nghỉ để đi thi. Phòng thi yên tĩnh, chỉ có tiếng bút chì. Không được xem đáp án cho tới khi có kết quả.',
    ok: 'Bắt đầu làm bài ✏️',
  });
  const pool = questionsOfLevel(E.lv).sort(() => Math.random() - 0.5).slice(0, N_Q);
  const bySec = {};
  let ok = 0;
  for (let i = 0; i < pool.length; i++) {
    const q = shuffleQ(pool[i]);
    const right = await ask(q, { who: `JLPT ${E.lv} · ${KIND[q.k].sec}`, title: `Câu ${i + 1}/${pool.length}`, feedback: 'none' });
    answer(S.lang, q, right, { mult: 0.5 });
    const sec = KIND[q.k].sec;
    bySec[sec] = bySec[sec] || { ok: 0, n: 0 };
    bySec[sec].n++;
    if (right) { ok++; bySec[sec].ok++; }
  }
  const score = ok / pool.length;
  const secOk = Object.values(bySec).every((x) => x.ok / x.n >= 1 / 3);
  E.taken = true;
  E.score = score;
  E.secs = bySec;
  E.passHidden = score >= 0.6 && secOk;
  S.time = Math.max(S.time, 15 * 60);
  await modal({ title: 'Nộp bài!', text: `Bạn đã làm xong ${pool.length} câu. Kết quả sẽ có vào khoảng tháng ${monthOf(s.result)}. Hồi hộp quá…` });
}

async function announce(S) {
  const E = S.exam;
  E.pass = !!E.passHidden;
  const rows = Object.entries(E.secs || {}).map(([k, v]) => `<div class="prow"><span>${esc(k)}</span><span>${v.ok}/${v.n}</span></div>`).join('');
  const html = `<div class="payslip">${rows}<div class="prow net"><span>Tổng</span><span>${Math.round(E.score * 100)}%</span></div></div>`;
  if (E.pass) {
    S.certs.push({ type: 'JLPT', lv: E.lv, day: S.day });
    grantLevel(S.lang, E.lv);
    addLog(S, `ĐỖ JLPT ${E.lv}!`);
    sfx('end');
    S.mood = Math.min(100, S.mood + 15);
    S.rep = Math.min(100, S.rep + 5);
    await modal({ who: 'Kết quả JLPT', title: `🎉 ĐỖ ${E.lv}!`, jp: '合格', text: `Chúc mừng! Bạn đã có chứng chỉ <b>JLPT ${E.lv}</b>. Chứng chỉ giúp tăng lương, dễ chuyển visa và được mọi người nể hơn.`, html });
  } else {
    addLog(S, `Trượt JLPT ${E.lv}`);
    sfx('bad');
    S.mood = Math.max(0, S.mood - 8);
    await modal({ who: 'Kết quả JLPT', title: `Chưa đỗ ${E.lv}`, jp: '不合格', text: 'Lần này chưa được. Mỗi năm có 2 kỳ thi — ôn lại câu sai và thử lại nhé!', html });
  }
  S.exam = null;
}

// Phụ cấp lương theo chứng chỉ
export function certBonus(S) {
  return { '': 0, N5: 0.01, N4: 0.03, N3: 0.06, N2: 0.1, N1: 0.15 }[bestCert(S)] || 0;
}
