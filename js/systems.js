// Nối các hệ thống vào bus sự kiện. Thứ tự ưu tiên: số nhỏ chạy trước.
// Mỗi handler nhận (S, ctx). ctx.msgs = thông báo gom vào màn tóm tắt buổi sáng.
import { bus } from './bus.js';
import { clamp, isWorkday, addLog, seasonIdx, SEASONS, doy, year, ensureAttr, dow } from './state.js';
import { payroll } from './payroll.js';
import { socialDaily, atLeast } from './social.js';
import { careerMorning } from './career.js';
import { loanCheck } from './community.js';
import { romanceDaily } from './romance.js';
import { familyWeekly, runFamilyEvent } from './family.js';
import { examMorning } from './exam.js';
import { fixedEvent, markFixed, randomEvent, runEvent } from './events.js';
import { invalidateMap } from './town.js';
import { aiMorningMsgs, aiProactive } from './ai/proactive.js';
import { ensureHomes } from './homes.js';
import { bankMonthEnd } from './bank.js';
import { jobsMonthEnd, employed, ensureEmp } from './jobs.js';
import { modal } from './ui.js';
import { isBirthday } from './dating.js';
import { PEOPLE } from './ai/world.js';

// ---------- cuối ngày (trước khi sang ngày mới) ----------
bus.on('day:end', 10, (S, ctx) => {
  if (isWorkday(S) && !S.worked && !S.today.noWork && !S.today.sickLeave && employed(S)) {
    S.rep = clamp(S.rep - 12);
    S.stats.absences++;
    ctx.msgs.push('❌ Hôm qua bạn nghỉ làm không phép: uy tín −12.');
    addLog(S, 'Nghỉ làm không phép');
  }
}, 'vắng mặt');
bus.on('day:end', 20, (S) => socialDaily(S), 'quan hệ nguội dần');
bus.on('day:end', 30, (S, ctx) => {
  if (S.sick > 0 && atLeast(S, 'sato', 2)) { S.full = clamp(S.full + 30); S.health = clamp(S.health + 3); ctx.msgs.push('👵 Biết bạn ốm, bà Sato mang sang một nồi cháo nóng.'); }
  if (S.sick > 0) {
    S.sick--;
    S.health = clamp(S.health - 4);
    ctx.msgs.push(S.sick === 0 ? '🙂 Bạn đã khỏi cảm.' : '🤒 Vẫn còn ốm — nên đi khám hoặc uống thuốc.');
  } else if (S.health < 35 && Math.random() < 0.35) {
    S.sick = 3;
    ctx.msgs.push('🤒 Cơ thể kiệt sức, bạn bị cảm rồi.');
  }
}, 'ốm đau');

// ---------- đầu ngày ----------
bus.on('day:start', 5, (S, ctx) => { ensureHomes(S); aiMorningMsgs(S, ctx); }, 'NPC: tâm trạng, tin đồn, thu nợ');
// Chỉ số phụ theo ngày: bỏ tập thì thể lực giảm dần, ngoại hình cần giữ gìn; căng thẳng cao gây hại
bus.on('day:start', 6, (S, ctx) => {
  const A = ensureAttr(S);
  A.fit = Math.max(10, A.fit - 0.35); A.look = Math.max(15, A.look - 0.3);
  // căng thẳng: nợ nhiều, tăng ca, thất nghiệp làm tăng; ngủ đủ và nghỉ cuối tuần làm giảm
  A.stress = Math.max(0, Math.min(100, A.stress + (S.fin && S.money < 10000 ? 2 : 0) + (employed(S) ? 0.5 : 3) - (dow(S) >= 5 ? 3 : 1.5)));
  if (A.stress >= 75) { S.health = Math.max(0, S.health - 2); S.mood = Math.max(0, S.mood - 3); ctx.msgs.push('😣 Căng thẳng kéo dài — người mệt mỏi, dễ ốm. Thử tắm sentō, tập yoga, đi chơi với bạn.'); }
  // sinh nhật người quen
  for (const id of Object.keys(S.npc || {})) if (S.npc[id].met && S.npc[id].aff >= 40 && PEOPLE[id] && PEOPLE[id].traits && isBirthday(S, id)) ctx.msgs.push(`🎂 Hôm nay là sinh nhật ${PEOPLE[id].name}! Tặng quà hôm nay được thêm thiện cảm.`);
}, 'Chỉ số phụ, sinh nhật');
bus.on('day:start', 10, (S, ctx) => {
  if (seasonIdx(S) !== ctx.prevSeason) {
    invalidateMap();
    ctx.msgs.unshift(`🗓️ Sang mùa ${SEASONS[seasonIdx(S)].name} ${SEASONS[seasonIdx(S)].jp}!`);
  }
  if (doy(S) === 1) { ctx.msgs.unshift(`🎊 Bắt đầu năm thứ <b>${year(S)}</b> của bạn ở Nhật!`); addLog(S, `Bắt đầu năm thứ ${year(S)}`); }
  if (doy(S) === 63) S.flags.newyear = year(S);
}, 'mùa, năm mới');

// ---------- cuối tháng (Chủ Nhật) ----------
bus.on('month:end', 10, (S, ctx) => { ctx.msgs.push(payroll(S)); }, 'lương tháng');
bus.on('month:end', 12, (S, ctx) => { jobsMonthEnd(S, ctx); }, 'việc làm: thử việc, thăng chức, thất nghiệp');
bus.on('month:end', 15, (S, ctx) => { bankMonthEnd(S, ctx); }, 'ngân hàng, thị trường, trả góp');
bus.on('month:end', 20, async (S, ctx) => {
  const fw = await familyWeekly(S);
  ctx.msgs.push(...fw.msgs);
  ctx.famEvent = fw.event;
}, 'gia đình hằng tháng');

// ---------- buổi sáng: các việc cần người chơi quyết định ----------
bus.on('morning', 5, async (S, ctx) => {
  if (!ctx.unemployedOut) return null;
  await modal({ title: '🛂 Mất tư cách lưu trú', text: 'Bạn thất nghiệp quá 3 tháng mà không tìm được việc mới. Cục Xuất nhập cảnh hủy tư cách lưu trú lao động của bạn.' });
  ctx.endKind = 'visa';
  return 'end';
}, 'thất nghiệp quá hạn');
bus.on('morning', 10, async (S, ctx) => {
  const cr = await careerMorning(S);
  if (cr) { ctx.endKind = cr === 'ending-home' ? 'home' : 'visa'; return 'end'; }
  return null;
}, 'visa');
bus.on('morning', 20, (S) => loanCheck(S), 'đòi nợ');
bus.on('morning', 30, (S) => romanceDaily(S), 'tình cảm');
bus.on('morning', 40, async (S, ctx) => { if (ctx.famEvent) { await runFamilyEvent(S, ctx.famEvent); return 'stop'; } return null; }, 'chuyện gia đình');
bus.on('morning', 50, async (S) => ((await examMorning(S)) ? 'stop' : null), 'JLPT');
bus.on('morning', 55, (S) => aiProactive(S), 'NPC chủ động');
bus.on('morning', 60, async (S) => {
  const fixed = fixedEvent(S, 'morning');
  if (fixed) { markFixed(S, fixed); await runEvent(fixed); return null; }
  if (Math.random() < 0.38) { const ev = randomEvent(S, 'morning'); if (ev) await runEvent(ev); }
  return null;
}, 'sự kiện');
