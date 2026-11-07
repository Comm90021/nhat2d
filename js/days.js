// Vòng lặp ngày: ngủ, sang ngày mới, lĩnh lương, ốm, ngất, kết thúc.
import {
  G, DAY_START, MIDNIGHT, DOW, SEASONS, START_DEBT, seasonIdx, dow, isWorkday, doy, year, month,
  applyFx, tickNeeds, energyCap, yen, vnd, jpLevel, bestCert, addLog, save, clearSave, clamp,
} from './state.js';
import { visaInfo } from './career.js';
import { fam, famText } from './family.js';
import { partner, isMarried } from './romance.js';
import { levelIndex } from './learning.js';
import { modal, chips, esc } from './ui.js';
import { placePlayer } from './town.js';
import { placeInUnit } from './world/scene.js';
import { sfx } from './audio.js';
import { bus } from './bus.js';
import { isMonthEnd, holidayName } from './calendar.js';
import { pay, assetEffect } from './finance.js';
import { employed, endEmployment } from './jobs.js';

function rollWeather(S) {
  const si = seasonIdx(S), r = Math.random();
  if (si === 0) return doy(S) >= 15 ? (r < 0.5 ? 'rain' : r < 0.7 ? 'cloudy' : 'clear') : r < 0.2 ? 'rain' : r < 0.32 ? 'cloudy' : 'clear';
  if (si === 1) return doy(S) <= 25 ? (r < 0.5 ? 'rain' : r < 0.7 ? 'cloudy' : 'clear') : (r < 0.15 ? 'rain' : 'clear');
  if (si === 2) return r < 0.25 ? 'rain' : r < 0.4 ? 'cloudy' : 'clear';
  return r < 0.35 ? 'snow' : r < 0.55 ? 'cloudy' : 'clear';
}
const WEATHER_TXT = { clear: '☀️ Trời đẹp', cloudy: '☁️ Nhiều mây', rain: '🌧️ Mưa', snow: '🌨️ Tuyết rơi' };

export async function sleep(S, opts = {}) {
  const mins = Math.max(60, MIDNIGHT + DAY_START - S.time);
  tickNeeds(S, mins, true);
  const hours = mins / 60;
  S.energy = Math.min(energyCap(S), S.energy + hours * 13 + assetEffect(S, 'sleep'));
  applyFx(S, hours >= 7 ? { health: 3, mood: 2 } : { health: -3, mood: -2 });
  if (opts.passedOut) applyFx(S, { health: -5, mood: -5 });
  await endDay(S);
}

// Vòng ngày chạy qua bus sự kiện (đăng ký trong systems.js)
async function endDay(S) {
  const ctx = { msgs: [], prevSeason: seasonIdx(S) };
  await bus.emit('day:end', S, ctx);
  if (S.rep <= 0) {
    if (S.career.visa.startsWith('tts') || !employed(S)) return ending(S, 'fired');
    endEmployment(S, 'Bị công ty cho nghỉ việc');
    S.rep = 30;
    ctx.msgs.push('📩 Công ty chấm dứt hợp đồng vì vi phạm nhiều lần. Bạn có 3 tháng để tìm việc mới, nếu không sẽ mất visa.');
  }
  S.day++;
  S.time = DAY_START;
  S.worked = false;
  S.today = {};
  S.weather = rollWeather(S);
  await bus.emit('day:start', S, ctx);
  if (isMonthEnd(S)) await bus.emit('month:end', S, ctx);
  placePlayer('dorm');
  if (S.wakeUnit) { placeInUnit(S.wakeUnit); S.wakeUnit = null; }
  save();
  await morning(S, ctx);
}

async function morning(S, ctx) {
  const msgs = ctx.msgs;
  const html = msgs.length ? `<div class="msgs">${msgs.map((m) => (m.startsWith('<') ? m : `<p>${m}</p>`)).join('')}</div>` : '';
  const hol = holidayName(S);
  const work = hol && isWorkday(S) ? `🎌 ${hol} — chỗ làm của bạn vẫn mở cửa (phụ cấp ngày lễ +35%).` : hol ? `🎌 ${hol} — công ty nghỉ.` : isWorkday(S) ? '🏭 Ngày làm việc — có mặt trước 08:00.' : dow(S) === 5 ? '⏱️ Thứ Bảy — có thể làm thêm buổi sáng.' : '🌿 Chủ Nhật — cuối tháng, ngày lĩnh lương.';
  await modal({
    who: `Năm ${year(S)} · Tháng ${month(S)} · ngày thứ ${S.day} ở Nhật`,
    title: `${DOW[dow(S)]} · Mùa ${SEASONS[seasonIdx(S)].name}`,
    text: `${WEATHER_TXT[S.weather]} · ${work}`,
    html,
    ok: 'Bắt đầu ngày mới ☀️',
  });
  const r = await bus.emit('morning', S, ctx);
  if (r === 'end') return ending(S, ctx.endKind || 'visa');
  save();
}

export async function passOut(S) {
  await modal({ title: '💫 Ngủ gục', text: 'Đã quá nửa đêm… Bạn kiệt sức và ngủ gục giữa đường. Một người tốt bụng gọi điện cho ký túc xá, anh Long ra đưa bạn về.' });
  await sleep(S, { passedOut: true });
}

// Kiểm tra tình huống nguy hiểm. Trả về true nếu đã xử lý.
export async function critical(S) {
  if (S.health <= 0) {
    await modal({
      title: '🚑 Bạn ngất xỉu!', jp: '救急車',
      text: 'Bạn được xe cấp cứu đưa vào viện. Bảo hiểm y tế chi trả 70%, bạn vẫn phải trả 9.000¥. Bác sĩ dặn phải ăn uống, ngủ nghỉ đầy đủ.',
    });
    pay(S, 9000, 'health', 'Cấp cứu, nằm viện');
    S.today.sickLeave = true;
    S.sick = 0;
    S.time = Math.max(S.time, 22 * 60);
    await sleep(S);
    if (G.S) { S.health = 45; S.energy = 60; S.mood = clamp(S.mood - 10); }
    return true;
  }
  if (S.mood <= 0) {
    await modal({
      title: '😞 Suy sụp tinh thần', text: 'Mọi thứ dồn lại khiến bạn không chịu nổi. Bạn ngồi khóc một mình rồi gọi về cho mẹ. Nói chuyện xong, bạn quyết định nghỉ ngơi cho lại sức.',
    });
    S.mood = 30;
    S.time += 180;
    return true;
  }
  if (S.rep <= 0) { await ending(S, 'fired'); return true; }
  return false;
}

export async function ending(S, kind) {
  const home = S.fin.debts.find((d) => d.id === 'home');
  const principal = home ? home.principal : START_DEBT;
  const paid = Math.max(0, principal - Math.max(0, S.debt));
  const ratio = principal ? paid / principal : 1;
  const score = Math.round(35 * Math.min(1, ratio) + 20 * (levelIndex(S.lang) / 5) + 10 * S.rep / 100 + 10 * S.health / 100 + 13 * S.mood / 100 + 12 * fam(S).sat / 100);
  const yrs = year(S);
  let title, text;
  if (kind === 'fired') {
    title = '✈️ Bị cho về nước';
    text = 'Uy tín của bạn ở công ty đã cạn. Sau nhiều lần cảnh cáo, công ty và nghiệp đoàn quyết định chấm dứt hợp đồng. Chuyến bay về nước nặng trĩu…';
  } else if (kind === 'visa') {
    title = '🛂 Hết hạn lưu trú';
    text = `${visaInfo(S).name} đã hết hạn mà bạn không đủ điều kiện chuyển tiếp (ví dụ: chưa đỗ thi tay nghề). Bạn phải thu xếp về nước sau ${yrs} năm ở Nhật.`;
  } else if (score >= 85) {
    title = '🌟 Trở về rạng rỡ';
    text = `Sau ${yrs} năm ở Nhật: nợ đã trả, tiếng Nhật vững, được công ty quý trọng. Bố mẹ tự hào về bạn!`;
  } else if (score >= 65) {
    title = '🌸 Những năm tháng đáng nhớ';
    text = `${yrs} năm ở Nhật với nhiều kỷ niệm đẹp. Còn vài điều chưa trọn, nhưng bạn đã trưởng thành rất nhiều.`;
  } else if (score >= 45) {
    title = '🍂 Vất vả nhưng không bỏ cuộc';
    text = 'Những năm ở Nhật đầy khó khăn: tiền chưa đủ, sức khỏe có lúc xuống dốc. Nhưng bạn vẫn đứng vững tới cuối cùng.';
  } else {
    title = '⛈️ Hành trình đầy sóng gió';
    text = 'Nhiều nước mắt hơn nụ cười. Có lẽ nếu làm lại, bạn sẽ chăm sóc bản thân và tiết kiệm tốt hơn.';
  }
  const html = `<div class="payslip">
    <div class="prow"><span>Điểm tổng kết</span><span><b>${score}/100</b></span></div>
    <div class="prow"><span>Đã gửi về trả nợ</span><span>${vnd(S.stats.sentVnd)}</span></div>
    <div class="prow"><span>Nợ còn lại</span><span>${vnd(Math.max(0, S.debt))}</span></div>
    <div class="prow"><span>Tiền mặt còn lại</span><span>${yen(S.money)}</span></div>
    <div class="prow"><span>Gia đình ở quê</span><span>${famText(fam(S).sat)}</span></div>
    <div class="prow"><span>Bạn đời / con cái</span><span>${S.love && isMarried(S) ? 'Kết hôn với ' + partner(S).name : S.love ? 'Đang yêu ' + partner(S).name : 'Độc thân'}${(S.kids || []).length ? ' · ' + S.kids.length + ' con' : ''}</span></div>
    <div class="prow"><span>Thời gian ở Nhật</span><span>${yrs} năm (${S.day} ngày)</span></div>
    <div class="prow"><span>Tiếng Nhật</span><span>${jpLevel(S)}${bestCert(S) ? ' · chứng chỉ JLPT ' + bestCert(S) : ' · chưa có chứng chỉ'}</span></div>
    <div class="prow"><span>Số ca đã làm / nghỉ không phép</span><span>${S.stats.shifts} / ${S.stats.absences}</span></div>
    <div class="prow"><span>Số câu tiếng Nhật đã học</span><span>${S.lang.phrases.length}</span></div>
    <div class="prow"><span>Sức khỏe / Tinh thần / Uy tín</span><span>${Math.round(S.health)} / ${Math.round(S.mood)} / ${Math.round(S.rep)}</span></div>
  </div>`;
  sfx('end');
  await modal({ wide: true, who: `Kết thúc — ${S.name}`, title, text, html, choices: [{ label: '🔁 Về màn hình chính', value: true, primary: true }] });
  clearSave();
  G.S = null;
  if (G.onEnd) G.onEnd();
}

export { chips };
