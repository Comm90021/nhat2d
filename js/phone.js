// Điện thoại: danh bạ, nhắn tin, rủ đi ăn, app học tiếng Nhật, lịch.
import { advance, doy, year, monthOf, dow, MIDNIGHT, YEAR_DAYS } from './state.js';
import { modal, toast, esc } from './ui.js';
import { PEOPLE, P, stageName, stageIdx, invite, gain, affBar, WHEN_TXT } from './social.js';
import { studyJapanese } from './quiz.js';
import { EVENTS } from './events.js';
import { SESSIONS, nextSessionText } from './exam.js';
import { endText, availableTest, TESTS, visaInfo } from './career.js';
import { romanceActions } from './romance.js';

const APP_MAX = 5;

export async function openPhone(S) {
  for (;;) {
    const met = Object.keys(PEOPLE).filter((id) => S.people && S.people[id] && S.people[id].met);
    const used = S.today.app || 0;
    const v = await modal({
      who: 'Điện thoại', title: '📱 Điện thoại',
      choices: [
        { label: `📇 Danh bạ (${met.length} người)`, sub: 'Nhắn tin hỏi thăm, rủ đi ăn', value: 'contacts' },
        { label: '📖 App học tiếng Nhật', sub: `1 câu · 10 phút · còn ${APP_MAX - used}/${APP_MAX} lượt hôm nay`, value: 'app', disabled: used >= APP_MAX || S.time + 10 > MIDNIGHT, reason: 'Hôm nay học đủ rồi, mai tiếp nhé' },
        { label: '📅 Lịch & việc sắp tới', value: 'cal' },
        { label: '👥 Ai ở đâu? (gợi ý làm quen)', value: 'where' },
        { label: '✖ Cất điện thoại', value: null, cancel: true },
      ],
    });
    if (!v) return;
    if (v === 'app') {
      S.today.app = used + 1;
      await studyJapanese(S, 1, { title: 'App · Câu' });
      advance(S, 10);
    }
    if (v === 'contacts') await contacts(S, met);
    if (v === 'cal') await modal({ who: 'Lịch', title: '📅 Lịch & việc sắp tới', html: calendarHtml(S), ok: 'Đóng' });
    if (v === 'where') await modal({ who: 'Gợi ý', title: '👥 Có thể gặp ai, ở đâu?', html: `<ul class="log">${Object.entries(WHEN_TXT).map(([id, t]) => `<li><b>${esc(PEOPLE[id].name)}</b> — ${esc(PEOPLE[id].role)}<br><span class="dim">${esc(t)}</span></li>`).join('')}</ul>`, ok: 'Đóng' });
  }
}

async function contacts(S, met) {
  if (!met.length) { await modal({ title: '📇 Danh bạ trống', text: 'Bạn chưa quen ai. Ra ngoài nói chuyện với mọi người nhé — xem mục "Ai ở đâu?".' }); return; }
  const list = met.sort((a, b) => S.people[b].aff - S.people[a].aff);
  const id = await modal({
    who: 'Danh bạ', title: '📇 Danh bạ',
    choices: [...list.map((x) => ({ label: `${PEOPLE[x].name} · ${stageName(S.people[x].aff)}`, sub: `${esc(PEOPLE[x].role)} · ${Math.round(S.people[x].aff)}/100`, value: x })), { label: '← Quay lại', value: null, cancel: true }],
  });
  if (!id) return;
  const p = P(S, id), d = PEOPLE[id];
  const evening = (S.time >= 17 * 60 && S.time < 22 * 60) || (dow(S) >= 5 && S.time >= 11 * 60 && S.time < 21 * 60);
  const rom = romanceActions(S, id).filter((a) => !a.label.includes('Tỏ tình') || evening);
  const act = await modal({
    who: d.role, title: d.name, html: affBar(p.aff) + (d.perks[stageIdx(p.aff)] ? `<p class="dim">Quyền lợi hiện tại: ${esc(d.perks[stageIdx(p.aff)])}</p>` : ''),
    choices: [
      { label: '💌 Nhắn tin hỏi thăm', sub: '5 phút · mỗi người 1 lần/ngày', value: 'msg', disabled: p.msg === S.day, reason: 'Hôm nay nhắn rồi' },
      { label: '🍜 Gọi rủ đi ăn', sub: '¥2,000 · 2 tiếng', value: 'eat', disabled: stageIdx(p.aff) < 1 || !evening || S.money < 2000, reason: stageIdx(p.aff) < 1 ? 'Chưa đủ thân' : !evening ? 'Chỉ rủ được buổi tối hoặc cuối tuần' : 'Không đủ tiền' },
      ...rom.map((a, k) => { const r = a.cond ? a.cond(S) : null; return { label: a.label, sub: a.sub, value: 'r' + k, disabled: !!r, reason: r }; }),
      { label: '← Quay lại', value: null, cancel: true },
    ],
  });
  if (typeof act === 'string' && act[0] === 'r') { await rom[+act.slice(1)].run(S); return; }
  if (act === 'msg') {
    p.msg = S.day;
    advance(S, 5);
    gain(S, id, 1);
    toast(`💌 ${d.name} đã trả lời tin nhắn của bạn`);
  }
  if (act === 'eat') await invite(S, id);
}

function calendarHtml(S) {
  const items = [];
  const C = S.career;
  items.push(`🛂 Visa ${esc(visaInfo(S).short)} hết hạn: ${endText(S)}`);
  const t = availableTest(S);
  if (t) items.push(`📋 Có thể thi tay nghề <b>${TESTS[t].name}</b> ở chỗ làm (ngày thường, trước 10:00)`);
  if (S.exam) {
    const s = SESSIONS.find((x) => x.id === S.exam.sess);
    items.push(S.exam.taken ? `📝 Đang chờ kết quả JLPT ${S.exam.lv} (tháng ${monthOf(s.result)})` : `📝 Thi JLPT ${S.exam.lv}: tháng ${monthOf(s.exam)} (còn ${s.exam - doy(S)} ngày)`);
  } else items.push(`📝 ${nextSessionText(S)}`);
  const d = doy(S);
  const soon = EVENTS.filter((e) => e.day && e.day > d && e.day <= d + 14).map((e) => `🗓️ ${e.title} — tháng ${monthOf(e.day)} (còn ${e.day - d} ngày)`);
  items.push(...soon);
  if (S.loan) items.push(`💸 Nợ vay nóng ${S.loan.amount.toLocaleString('en-US')}¥ — hạn trả còn ${S.loan.due - S.day} ngày`);
  items.push('⚽ Sáng Chủ Nhật: CLB bóng đá ở công viên · 🇻🇳 Chiều Chủ Nhật: hội người Việt');
  return `<ul class="log">${items.map((x) => `<li>${x}</li>`).join('')}</ul><p class="dim">Hôm nay: Năm ${year(S)}, ngày ${d}/${YEAR_DAYS} của năm.</p>`;
}
