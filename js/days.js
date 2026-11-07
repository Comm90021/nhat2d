// Vòng lặp ngày: ngủ, sang ngày mới, lĩnh lương, ốm, ngất, kết thúc.
import {
  G, TOTAL_DAYS, DAY_START, MIDNIGHT, DOW, SEASONS, START_DEBT, seasonIdx, dow, isWorkday,
  applyFx, tickNeeds, energyCap, yen, vnd, jpLevel, addLog, save, clearSave, clamp,
} from './state.js';
import { modal, chips, esc } from './ui.js';
import { fixedEvent, markFixed, randomEvent, runEvent } from './events.js';
import { placePlayer, invalidateMap } from './town.js';
import { sfx } from './audio.js';

const RENT = 14000;

function rollWeather(S) {
  const si = seasonIdx(S), r = Math.random();
  if (si === 0) return r < 0.2 ? 'rain' : r < 0.32 ? 'cloudy' : 'clear';
  if (si === 1) return S.day <= 21 ? (r < 0.55 ? 'rain' : r < 0.75 ? 'cloudy' : 'clear') : (r < 0.15 ? 'rain' : 'clear');
  if (si === 2) return r < 0.25 ? 'rain' : r < 0.4 ? 'cloudy' : 'clear';
  return r < 0.35 ? 'snow' : r < 0.55 ? 'cloudy' : 'clear';
}
const WEATHER_TXT = { clear: '☀️ Trời đẹp', cloudy: '☁️ Nhiều mây', rain: '🌧️ Mưa', snow: '🌨️ Tuyết rơi' };

export async function sleep(S, opts = {}) {
  const mins = Math.max(60, MIDNIGHT + DAY_START - S.time);
  tickNeeds(S, mins, true);
  const hours = mins / 60;
  S.energy = Math.min(energyCap(S), S.energy + hours * 13);
  applyFx(S, hours >= 7 ? { health: 3, mood: 2 } : { health: -3, mood: -2 });
  if (opts.passedOut) applyFx(S, { health: -5, mood: -5 });
  await endDay(S);
}

async function endDay(S) {
  const msgs = [];
  if (isWorkday(S) && !S.worked && !S.today.noWork && !S.today.sickLeave) {
    S.rep = clamp(S.rep - 12);
    S.stats.absences++;
    msgs.push('❌ Hôm qua bạn nghỉ làm không phép: uy tín −12.');
    addLog(S, 'Nghỉ làm không phép');
  }
  if (S.sick > 0) {
    S.sick--;
    S.health = clamp(S.health - 4);
    msgs.push(S.sick === 0 ? '🙂 Bạn đã khỏi cảm.' : '🤒 Vẫn còn ốm — nên đi khám hoặc uống thuốc.');
  } else if (S.health < 35 && Math.random() < 0.35) {
    S.sick = 3;
    msgs.push('🤒 Cơ thể kiệt sức, bạn bị cảm rồi.');
  }
  if (S.rep <= 0) return ending(S, 'fired');
  if (S.day >= TOTAL_DAYS) return ending(S, 'done');

  const prevSeason = seasonIdx(S);
  S.day++;
  S.time = DAY_START;
  S.worked = false;
  S.today = {};
  S.weather = rollWeather(S);
  if (seasonIdx(S) !== prevSeason) {
    invalidateMap();
    msgs.unshift(`🗓️ Sang mùa ${SEASONS[seasonIdx(S)].name} ${SEASONS[seasonIdx(S)].jp}!`);
  }
  if (dow(S) === 6) msgs.push(payday(S));
  placePlayer('dorm');
  save();
  await morning(S, msgs);
}

function payday(S) {
  const util = seasonIdx(S) === 3 ? 5500 : seasonIdx(S) === 1 ? 4000 : 3000;
  const net = S.wage - RENT - util;
  const html = `<div class="payslip"><b>🧾 Phiếu lương tuần (給与明細)</b>
    <div class="prow"><span>Lương (đã trừ thuế, bảo hiểm)</span><span>${yen(S.wage)}</span></div>
    <div class="prow neg"><span>Tiền nhà ký túc xá</span><span>−${yen(RENT)}</span></div>
    <div class="prow neg"><span>Điện · nước · gas</span><span>−${yen(util)}</span></div>
    <div class="prow net"><span>Thực nhận</span><span>${yen(net)}</span></div></div>`;
  S.money += net;
  S.wage = 0;
  sfx('coin');
  addLog(S, `Lĩnh lương tuần: ${yen(net)}`);
  return html;
}

async function morning(S, msgs) {
  const html = msgs.length ? `<div class="msgs">${msgs.map((m) => (m.startsWith('<') ? m : `<p>${m}</p>`)).join('')}</div>` : '';
  const work = isWorkday(S) ? '🏭 Ngày làm việc — có mặt trước 08:00.' : dow(S) === 5 ? '⏱️ Thứ Bảy — có thể làm thêm buổi sáng.' : '🌿 Chủ Nhật — ngày nghỉ.';
  await modal({
    who: `Ngày ${S.day}/${TOTAL_DAYS}`,
    title: `${DOW[dow(S)]} · Mùa ${SEASONS[seasonIdx(S)].name}`,
    text: `${WEATHER_TXT[S.weather]} · ${work}`,
    html,
    ok: 'Bắt đầu ngày mới ☀️',
  });
  const fixed = fixedEvent(S, 'morning');
  if (fixed) { markFixed(S, fixed); await runEvent(fixed); }
  else if (Math.random() < 0.38) {
    const ev = randomEvent(S, 'morning');
    if (ev) await runEvent(ev);
  }
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
    S.money -= 9000;
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
  const paid = Math.max(0, START_DEBT - Math.max(0, S.debt));
  const ratio = paid / START_DEBT;
  const score = Math.round(40 * Math.min(1, ratio) + 20 * Math.min(1, S.jp / 75) + 15 * S.rep / 100 + 10 * S.health / 100 + 15 * S.mood / 100);
  let title, text;
  if (kind === 'fired') {
    title = '✈️ Bị cho về nước';
    text = 'Uy tín của bạn ở công ty đã cạn. Sau nhiều lần cảnh cáo, công ty và nghiệp đoàn quyết định chấm dứt hợp đồng thực tập. Chuyến bay về nước nặng trĩu…';
  } else if (score >= 85) {
    title = '🌟 Thực tập sinh xuất sắc';
    text = 'Một năm vất vả nhưng trọn vẹn: nợ đã trả, tiếng Nhật tiến bộ, công ty muốn giữ bạn ở lại thêm. Bố mẹ tự hào về bạn!';
  } else if (score >= 65) {
    title = '🌸 Một năm đáng nhớ';
    text = 'Bạn đã vượt qua năm đầu tiên ở Nhật với nhiều kỷ niệm đẹp. Còn vài điều phải cố gắng, nhưng bạn đã trưởng thành rất nhiều.';
  } else if (score >= 45) {
    title = '🍂 Vất vả nhưng không bỏ cuộc';
    text = 'Năm đầu đầy khó khăn: tiền chưa đủ, sức khỏe có lúc xuống dốc. Nhưng bạn vẫn đứng vững tới cuối cùng.';
  } else {
    title = '⛈️ Năm đầu đầy sóng gió';
    text = 'Một năm nhiều nước mắt. Có lẽ năm sau bạn sẽ chăm sóc bản thân tốt hơn và tiết kiệm hơn.';
  }
  const html = `<div class="payslip">
    <div class="prow"><span>Điểm tổng kết</span><span><b>${score}/100</b></span></div>
    <div class="prow"><span>Đã gửi về trả nợ</span><span>${vnd(S.stats.sentVnd)}</span></div>
    <div class="prow"><span>Nợ còn lại</span><span>${vnd(Math.max(0, S.debt))}</span></div>
    <div class="prow"><span>Tiền mặt còn lại</span><span>${yen(S.money)}</span></div>
    <div class="prow"><span>Tiếng Nhật</span><span>${jpLevel(S.jp)}${S.cert ? ' · có chứng chỉ ' + S.cert : ''}</span></div>
    <div class="prow"><span>Số ca đã làm / nghỉ không phép</span><span>${S.stats.shifts} / ${S.stats.absences}</span></div>
    <div class="prow"><span>Số câu tiếng Nhật đã học</span><span>${S.learned.length}</span></div>
    <div class="prow"><span>Sức khỏe / Tinh thần / Uy tín</span><span>${Math.round(S.health)} / ${Math.round(S.mood)} / ${Math.round(S.rep)}</span></div>
  </div>`;
  sfx('end');
  await modal({ wide: true, who: `Kết thúc — ${S.name}`, title, text, html, choices: [{ label: '🔁 Về màn hình chính', value: true, primary: true }] });
  clearSave();
  G.S = null;
  if (G.onEnd) G.onEnd();
}

export { chips };
