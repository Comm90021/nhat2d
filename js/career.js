// Lộ trình tư cách lưu trú (visa) và thi tay nghề. 1 năm trong game = 56 ngày.
import { YEAR_DAYS, year, monthOf, doy, addLog, applyFx, bestCert, yen } from './state.js';
import { JOBS } from './data.js';
import { modal, chips, esc } from './ui.js';
import { ask } from './quiz.js';
import { pickWork } from './quiz.js';
import { sfx } from './audio.js';

const Y = YEAR_DAYS;
export const VISAS = {
  tts1: { short: 'TTS số 1', name: 'Thực tập sinh số 1 (技能実習1号)', years: 1, pay: 1, family: false, change: false },
  tts2: { short: 'TTS số 2', name: 'Thực tập sinh số 2 (技能実習2号)', years: 2, pay: 1.05, family: false, change: false },
  tts3: { short: 'TTS số 3', name: 'Thực tập sinh số 3 (技能実習3号)', years: 2, pay: 1.12, family: false, change: false },
  ssw1: { short: 'KNĐĐ số 1', name: 'Kỹ năng đặc định số 1 (特定技能1号)', years: 1, pay: 1.2, family: false, change: true },
  ssw2: { short: 'KNĐĐ số 2', name: 'Kỹ năng đặc định số 2 (特定技能2号)', years: 3, pay: 1.35, family: true, change: true },
  spouse: { short: 'Vợ/chồng', name: 'Vợ/chồng người Nhật (日本人の配偶者等)', years: 3, pay: 1.2, family: true, change: true },
  pr: { short: 'Thường trú', name: 'Thường trú nhân (永住者)', years: 0, pay: 1.35, family: true, change: true },
};
export const TESTS = {
  kiso: { name: '技能検定 基礎級', vi: 'Thi tay nghề bậc cơ bản', visa: 'tts1', from: 28, n: 10, pass: 0.6, note: 'Bắt buộc phải đỗ để lên TTS số 2.' },
  san: { name: '技能検定 随時3級', vi: 'Thi tay nghề bậc 3', visa: 'tts2', from: 84, n: 12, pass: 0.6, note: 'Cần đỗ (và công ty đánh giá tốt) để lên TTS số 3.' },
  ssw2: { name: '特定技能2号評価試験', vi: 'Thi Kỹ năng đặc định số 2', visa: 'ssw1', from: 0, n: 14, pass: 0.7, note: 'Cần tay nghề cao, kinh nghiệm làm tổ trưởng (uy tín ≥ 65). Đỗ là chuyển sang KNĐĐ số 2.' },
};

export function newCareer(day = 1) {
  return { visa: 'tts1', start: day, end: day + Y, passed: {}, tried: {}, ssw1Start: null, history: [{ visa: 'tts1', day }], notified: null };
}
export const visaInfo = (S) => VISAS[S.career.visa];
export const daysLeft = (S) => (S.career.visa === 'pr' ? Infinity : S.career.end - S.day);
export function endText(S) {
  if (S.career.visa === 'pr') return 'không thời hạn';
  const e = S.career.end;
  return `Năm ${Math.floor((e - 1) / Y) + 1} · Tháng ${monthOf(((e - 1) % Y) + 1)} (còn ${e - S.day} ngày)`;
}
export function skillRank(S) {
  const s = (S.skill && S.skill[S.job]) || 0;
  return s >= 160 ? 'Tổ trưởng (班長)' : s >= 90 ? 'Thành thạo (ベテラン)' : s >= 35 ? 'Làm độc lập (一人前)' : 'Học việc (見習い)';
}
export const payMul = (S) => visaInfo(S).pay * (1 + Math.min(0.15, ((S.skill && S.skill[S.job]) || 0) / 1200)) * (S.flags.betterJob ? 1.1 : 1);

export function setVisa(S, visa, years) {
  const C = S.career;
  C.visa = visa;
  C.start = S.day;
  C.end = years ? S.day + Math.round(years * Y) : Infinity;
  C.notified = null;
  C.history.push({ visa, day: S.day });
  if (visa === 'ssw1' && !C.ssw1Start) C.ssw1Start = S.day;
  addLog(S, `Tư cách lưu trú mới: ${VISAS[visa].name}`);
}

// ---------- thi tay nghề ----------
export function availableTest(S) {
  const C = S.career;
  for (const [id, t] of Object.entries(TESTS)) {
    if (t.visa !== C.visa || C.passed[id]) continue;
    if (S.day - C.start < t.from) continue;
    if (C.tried[id] && S.day - C.tried[id] < 7) continue;
    return id;
  }
  return null;
}
export function testBlockReason(S, id) {
  if (id === 'ssw2') {
    if (S.day - (S.career.ssw1Start || S.day) < 2 * Y) return 'Cần ít nhất 2 năm kinh nghiệm với KNĐĐ số 1';
    if (S.rep < 65) return 'Cần uy tín ≥ 65 (kinh nghiệm quản lý, chỉ dẫn người khác)';
  }
  return null;
}

export async function takeTest(S, id) {
  const t = TESTS[id];
  const C = S.career;
  await modal({
    who: JOBS[S.job].place, title: `📋 ${t.name}`, jp: t.vi,
    text: `${t.note}<br>Bài thi gồm <b>${t.n} câu</b> lý thuyết và thực hành. Đỗ khi đúng từ ${Math.round(t.pass * 100)}% trở lên. Không được xem đáp án trong lúc thi.`,
    ok: 'Vào thi ✏️',
  });
  let ok = 0;
  for (let i = 0; i < t.n; i++) {
    const q = pickWork(S, S.job);
    if (await ask(q, { who: `${t.name} · Câu ${i + 1}/${t.n}`, feedback: 'none' })) ok++;
  }
  C.tried[id] = S.day;
  S.worked = true;
  S.time = Math.max(S.time, 15 * 60);
  const score = ok / t.n;
  S.skill[S.job] = (S.skill[S.job] || 0) + ok;
  if (score >= t.pass) {
    C.passed[id] = S.day;
    addLog(S, `Đỗ ${t.name}`);
    sfx('end');
    const out = applyFx(S, { mood: 12, rep: 5 });
    let extra = '';
    if (id === 'ssw2') { setVisa(S, 'ssw2', VISAS.ssw2.years); extra = '<br>🎉 Hồ sơ đổi tư cách lưu trú được chấp thuận: bạn chính thức có <b>visa Kỹ năng đặc định số 2</b> — không giới hạn số lần gia hạn, được bảo lãnh gia đình sang Nhật.'; }
    await modal({ title: `🎉 ĐỖ ${t.name}!`, jp: '合格', text: `Đúng ${ok}/${t.n} câu.${extra}`, html: chips(out) });
  } else {
    addLog(S, `Trượt ${t.name}`);
    sfx('bad');
    const out = applyFx(S, { mood: -8 });
    await modal({ title: `Chưa đỗ ${t.name}`, jp: '不合格', text: `Đúng ${ok}/${t.n} câu. Ôn lại các tình huống ở chỗ làm, 1 tuần sau có thể thi lại.`, html: chips(out) });
  }
}

// ---------- thường trú ----------
export function prCheck(S) {
  const C = S.career;
  const workDays = C.history.reduce((acc, h, i) => {
    const next = C.history[i + 1] ? C.history[i + 1].day : S.day;
    return acc + (['ssw2', 'spouse'].includes(h.visa) ? next - h.day : 0);
  }, 0);
  const need = [];
  if (C.visa === 'pr') return { ok: false, need: ['Bạn đã là thường trú nhân'] };
  if (C.visa === 'spouse') { if (S.day - C.start < 3 * Y) need.push('Kết hôn và sống ở Nhật ít nhất 3 năm'); }
  else {
    if (S.day < 10 * Y) need.push(`Sống ở Nhật ít nhất 10 năm (hiện ${Math.floor(S.day / Y)} năm)`);
    if (workDays < 5 * Y) need.push(`Có ít nhất 5 năm với visa KNĐĐ số 2 / vợ chồng (hiện ${Math.floor(workDays / Y)} năm) — TTS và KNĐĐ số 1 không được tính`);
  }
  if (S.rep < 60) need.push('Uy tín ≥ 60');
  if (S.flags.taxLate) need.push('Không nợ thuế');
  if (S.money < 300000) need.push('Có khả năng tài chính ổn định (tiết kiệm ≥ ¥300,000)');
  return { ok: need.length === 0, need };
}

export async function applyPR(S) {
  const r = prCheck(S);
  if (!r.ok) {
    await modal({ who: 'Cục Quản lý Xuất nhập cảnh', title: '📄 Hồ sơ xin thường trú', text: 'Bạn chưa đủ điều kiện:<br>' + r.need.map((n) => '• ' + esc(n)).join('<br>') });
    return;
  }
  const fee = 10000;
  S.money -= fee;
  setVisa(S, 'pr', 0);
  sfx('end');
  await modal({ who: 'Cột mốc', title: '🏠 Được cấp thường trú!', jp: '永住許可', text: `Sau ${Math.floor(S.day / Y)} năm, bạn trở thành thường trú nhân Nhật Bản: không cần gia hạn visa, tự do chọn việc. Bạn vẫn có thể tiếp tục cuộc sống ở đây.`, html: chips([['money', -fee]]) });
}

// ---------- mỗi sáng: nhắc hạn, chuyển visa ----------
export async function careerMorning(S) {
  const C = S.career;
  if (C.visa === 'pr') return null;
  const left = C.end - S.day;
  if (left > 0 && left <= 9 && C.notified !== C.end) {
    C.notified = C.end;
    await modal({ who: 'Nghiệp đoàn / công ty', title: '⏳ Visa sắp hết hạn', text: `${esc(visaInfo(S).name)} sẽ hết hạn sau <b>${left} ngày</b>.<br>${needText(S)}` });
    return null;
  }
  if (left > 0) return null;
  return transition(S);
}

function needText(S) {
  const C = S.career;
  if (C.visa === 'tts1') return C.passed.kiso ? '✅ Đã đỗ 基礎級 — sẽ được lên TTS số 2.' : '❗ Bạn phải đỗ <b>技能検定 基礎級</b> (thi ở chỗ làm) trước khi hết hạn, nếu không sẽ phải về nước.';
  if (C.visa === 'tts2') return 'Hết TTS số 2, bạn có thể: lên TTS số 3 (cần đỗ 随時3級 + uy tín ≥ 60), chuyển sang Kỹ năng đặc định số 1 (miễn thi vì đã hoàn thành TTS số 2), hoặc về nước.';
  if (C.visa === 'tts3') return 'Hết TTS số 3, bạn có thể chuyển sang Kỹ năng đặc định số 1 hoặc về nước.';
  if (C.visa === 'ssw1') return 'Visa KNĐĐ số 1 được gia hạn từng năm, tối đa 5 năm. Muốn ở lâu hơn: thi đỗ KNĐĐ số 2.';
  return 'Công ty sẽ giúp bạn làm hồ sơ gia hạn.';
}

// Trả về 'ending' nếu phải về nước
async function transition(S) {
  const C = S.career;
  if (C.visa === 'tts1') {
    if (C.passed.kiso) {
      setVisa(S, 'tts2', 2);
      sfx('end');
      await modal({ who: 'Cột mốc', title: '🎉 Lên Thực tập sinh số 2', text: 'Bạn đã hoàn thành năm đầu tiên và đỗ thi tay nghề. Hợp đồng được gia hạn thêm <b>2 năm</b>, lương tăng nhẹ.' });
      return null;
    }
    return 'ending';
  }
  if (C.visa === 'tts2' || C.visa === 'tts3') {
    const backed = S.people && S.people.yamada && S.people.yamada.aff >= 70;
    const canT3 = C.visa === 'tts2' && C.passed.san && (S.rep >= 60 || backed);
    const v = await modal({
      who: 'Hết hạn hợp đồng', title: `📄 Kết thúc ${visaInfo(S).short}`, text: needText(S),
      choices: [
        ...(C.visa === 'tts2' ? [{ label: '🏭 Lên TTS số 3 (thêm 2 năm)', sub: 'Thực tế phải về nước ít nhất 1 tháng trước khi bắt đầu', value: 'tts3', disabled: !canT3, reason: !C.passed.san ? 'Cần đỗ 随時3級' : 'Cần uy tín ≥ 60 hoặc được tổ trưởng bảo lãnh' }] : []),
        { label: '🛂 Chuyển sang Kỹ năng đặc định số 1', sub: 'Lương cao hơn, được đổi chỗ làm cùng ngành, gia hạn từng năm (tối đa 5 năm)', value: 'ssw1', disabled: S.rep < 35, reason: 'Uy tín quá thấp, công ty không bảo lãnh' },
        { label: '✈️ Về nước', value: 'home' },
      ],
    });
    if (v === 'home') return 'ending-home';
    if (v === 'tts3') { setVisa(S, 'tts3', 2); S.money -= 60000; await modal({ title: '✈️ Về thăm nhà 1 tháng', text: 'Bạn về Việt Nam một tháng theo quy định trước khi bắt đầu TTS số 3. Tiền vé và chi tiêu: ¥60,000. Gặp lại bố mẹ, bạn thấy mình đã khác nhiều.', html: chips([['money', -60000]]) }); S.mood = Math.min(100, S.mood + 25); return null; }
    setVisa(S, 'ssw1', 1);
    sfx('end');
    await modal({ who: 'Cột mốc', title: '🛂 Kỹ năng đặc định số 1', jp: '特定技能1号', text: 'Bạn không còn là thực tập sinh nữa! Lương tăng, được tự chọn chỗ làm trong cùng ngành. Visa gia hạn từng năm, tổng cộng tối đa 5 năm. Lưu ý: KNĐĐ số 1 không được bảo lãnh gia đình sang.' });
    return null;
  }
  if (C.visa === 'ssw1') {
    const used = S.day - (C.ssw1Start || C.start);
    if (used >= 5 * Y) {
      await modal({ who: 'Hết hạn', title: '📄 Đã hết 5 năm KNĐĐ số 1', text: 'Kỹ năng đặc định số 1 tối đa 5 năm. Bạn chưa chuyển được sang KNĐĐ số 2 nên phải về nước.' });
      return 'ending';
    }
    if (S.rep < 25) return 'ending';
    C.end = S.day + Y;
    C.notified = null;
    addLog(S, 'Gia hạn visa KNĐĐ số 1 thêm 1 năm');
    await modal({ title: '🛂 Gia hạn visa', text: `Visa KNĐĐ số 1 được gia hạn thêm 1 năm. Đã dùng ${Math.floor(used / Y)}/5 năm.` });
    return null;
  }
  // ssw2, vợ/chồng: gia hạn tự động
  C.end = S.day + Math.round(visaInfo(S).years * Y);
  C.notified = null;
  addLog(S, `Gia hạn ${visaInfo(S).short}`);
  await modal({ title: '🛂 Gia hạn visa', text: `${esc(visaInfo(S).name)} được gia hạn thêm ${visaInfo(S).years} năm.` });
  return null;
}

export function journeyHtml(S) {
  const C = S.career;
  const row = (a, b) => `<div class="prow"><span>${a}</span><span>${b}</span></div>`;
  const hist = C.history.map((h) => `<li><span class="dim">Ngày ${h.day}:</span> ${esc(VISAS[h.visa].name)}</li>`).join('');
  const passed = Object.keys(C.passed).map((k) => TESTS[k].name).join(', ') || 'chưa có';
  const t = availableTest(S);
  return `<div class="payslip">${row('🛂 Tư cách lưu trú', esc(visaInfo(S).name))}${row('⏳ Hết hạn', endText(S))}${row('🛠️ Tay nghề', `${skillRank(S)} (${(S.skill && S.skill[S.job]) || 0} điểm)`)}${row('📋 Đã đỗ tay nghề', passed)}${row('👨‍👩‍👧 Bảo lãnh gia đình', visaInfo(S).family ? 'được' : 'không')}</div>
    ${t ? `<p class="dim">📋 Có thể thi <b>${TESTS[t].name}</b> ở chỗ làm.</p>` : ''}
    <h3>Hành trình</h3><ul class="log">${hist}</ul>`;
}
