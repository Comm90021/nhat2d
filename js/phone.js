// Điện thoại: danh bạ, nhắn tin, rủ đi ăn, app học tiếng Nhật, lịch.
import { advance, doy, year, monthOf, dow, MIDNIGHT, YEAR_DAYS } from './state.js';
import { modal, toast, esc } from './ui.js';
import { PEOPLE, P, stageName, stageIdx, invite, gain, affBar, WHEN_TXT } from './social.js';
import { studyJapanese } from './quiz.js';
import { EVENTS } from './events.js';
import { SESSIONS, nextSessionText } from './exam.js';
import { endText, availableTest, TESTS, visaInfo } from './career.js';
import { romanceActions } from './romance.js';
import { CAT, monthReport } from './finance.js';
import { openBank } from './bank.js';
import { openJobs } from './jobs.js';
import { openMap } from './mapview.js';
import { familyText } from './homes.js';
import { inviteDate, heartsHtml, knownHtml, isPartner, addAtt } from './dating.js';
import { chips } from './ui.js';
import { stateOf, moodInfo } from './ai/sim.js';
import { AI_PLACES } from './ai/world.js';
import { ACT } from './ai/rules.js';
import { yen, vnd, month } from './state.js';

const APP_MAX = 5;

export async function openPhone(S) {
  for (;;) {
    const met = Object.keys(PEOPLE).filter((id) => S.npc && S.npc[id] && S.npc[id].met);
    const used = S.today.app || 0;
    const v = await modal({
      who: 'Điện thoại', title: '📱 Điện thoại',
      choices: [
        { label: `📇 Danh bạ (${met.length} người)`, sub: 'Nhắn tin hỏi thăm, rủ đi ăn', value: 'contacts' },
        { label: '📖 App học tiếng Nhật', sub: `1 câu · 10 phút · còn ${APP_MAX - used}/${APP_MAX} lượt hôm nay`, value: 'app', disabled: used >= APP_MAX || S.time + 10 > MIDNIGHT, reason: 'Hôm nay học đủ rồi, mai tiếp nhé' },
        { label: '📅 Lịch & việc sắp tới', value: 'cal' },
        { label: '💼 Việc làm', sub: 'Tìm việc, chuyển việc, thi chứng chỉ nghề', value: 'jobs' },
        { label: '🏦 Ngân hàng', sub: 'Tài khoản, chuyển tiền, tiết kiệm, đầu tư, vay, vé số, mua sắm', value: 'bank' },
        { label: '🗺️ Bản đồ', sub: 'Xem 3 khu, chọn nơi đến: tự đi bộ / xe buýt / taxi (phím M)', value: 'map' },
        { label: '👥 Ai đang ở đâu?', sub: 'Mỗi người có lịch sống riêng', value: 'where' },
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
    if (v === 'bank') await openBank(S);
    if (v === 'jobs') await openJobs(S);
    if (v === 'map') { await openMap(S); return; }
    if (v === 'cal') await modal({ who: 'Lịch', title: '📅 Lịch & việc sắp tới', html: calendarHtml(S), ok: 'Đóng' });
    if (v === 'where') await modal({ who: 'Ngay lúc này', title: '👥 Ai đang ở đâu?', wide: true, html: whereHtml(S), ok: 'Đóng' });
  }
}

async function contacts(S, met) {
  if (!met.length) { await modal({ title: '📇 Danh bạ trống', text: 'Bạn chưa quen ai. Ra ngoài nói chuyện với mọi người nhé — xem mục "Ai ở đâu?".' }); return; }
  const list = met.sort((a, b) => S.npc[b].aff - S.npc[a].aff);
  const id = await modal({
    who: 'Danh bạ', title: '📇 Danh bạ',
    choices: [...list.map((x) => ({ label: `${PEOPLE[x].name} · ${stageName(S.npc[x].aff)}`, sub: `${esc(PEOPLE[x].role)} · ${Math.round(S.npc[x].aff)}/100`, value: x })), { label: '← Quay lại', value: null, cancel: true }],
  });
  if (!id) return;
  const p = P(S, id), d = PEOPLE[id];
  const evening = (S.time >= 17 * 60 && S.time < 22 * 60) || (dow(S) >= 5 && S.time >= 11 * 60 && S.time < 21 * 60);
  // qua điện thoại: không có cử chỉ thân mật / qua đêm
  const rom = romanceActions(S, id).filter((a) => (!a.label.includes('Tỏ tình') || evening) && !/^(🤝|🤗|💋|🌙)/.test(a.label));
  const act = await modal({
    who: d.role, title: d.name, html: affBar(p.aff) + heartsHtml(S, id) + knownHtml(S, id) + `<p class="dim">🏠 ${familyText(S, id)}</p>` + (d.perks[stageIdx(p.aff)] ? `<p class="dim">Quyền lợi hiện tại: ${esc(d.perks[stageIdx(p.aff)])}</p>` : ''),
    choices: [
      { label: '🗺️ Xem nhà / chỗ đang ở trên bản đồ', value: 'map' },
      { label: '💌 Nhắn tin hỏi thăm', sub: '5 phút · mỗi người 1 lần/ngày', value: 'msg', disabled: p.msg === S.day, reason: 'Hôm nay nhắn rồi' },
      { label: '📅 Rủ đi chơi / hẹn hò', sub: 'Chọn địa điểm và giờ hẹn', value: 'date', disabled: stageIdx(p.aff) < 1 && (p.att || 0) < 40, reason: 'Chưa đủ thân' },
      { label: '📞 Gọi điện nói chuyện', sub: 'Buổi tối · 20 phút', value: 'call', disabled: p.call === S.day || S.time < 18 * 60 || stageIdx(p.aff) < 1, reason: p.call === S.day ? 'Hôm nay gọi rồi' : stageIdx(p.aff) < 1 ? 'Chưa đủ thân' : 'Gọi buổi tối thôi' },
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
  if (act === 'date') await inviteDate(S, id);
  if (act === 'call') {
    p.call = S.day; advance(S, 20);
    const v = 2 + (isPartner(S, id) ? 1 : 0);
    gain(S, id, v); const da = addAtt(S, id, isPartner(S, id) ? 2 : 1);
    await modal({ who: `📞 ${d.name}`, title: '📞 Gọi điện', text: isPartner(S, id) ? 'Hai người nói chuyện đến khi pin điện thoại báo đỏ.' : `Hỏi han công việc, kể chuyện hôm nay. ${esc(d.name)} có vẻ vui vì bạn gọi.`, html: chips([['aff', v], ...(da ? [['att', da]] : [])]) });
  }
  if (act === 'map') { const pl = AI_PLACES[stateOf(S, id).place], home = AI_PLACES[d.home]; await openMap(S, (pl && pl.map !== 'off' && pl.map) || (home && home.map !== 'off' && home.map) || undefined); }
}

// Danh sách NPC đã quen (và các NPC chính) đang ở đâu, làm gì, tâm trạng — do AI quyết định
function whereHtml(S) {
  const known = Object.keys(PEOPLE).filter((id) => PEOPLE[id].traits && ((S.npc[id] && S.npc[id].met) || PEOPLE[id].core));
  const rows = known.map((id) => {
    const st = stateOf(S, id), pl = AI_PLACES[st.place], mi = moodInfo(S, id);
    const met = S.npc[id] && S.npc[id].met;
    return { id, text: `<li><b>${esc(PEOPLE[id].name)}</b> ${met ? mi.icon : ''} — ${(ACT[st.act] || ACT.home).label}${pl ? ` · <i>${esc(pl.name)}</i>${pl.map === 'minato' ? ' (khu Minato)' : ''}` : ''}<br><span class="dim">${esc(PEOPLE[id].role)}${met ? ` · tâm trạng: ${mi.name}` : ' · chưa quen'}</span></li>`, met };
  }).sort((a, b) => b.met - a.met);
  return `<p class="dim">Mỗi người có lịch sống riêng theo tính cách, công việc, tâm trạng và thời tiết. Tới đúng chỗ là gặp được.</p><ul class="log">${rows.map((r) => r.text).join('')}</ul>`;
}

function ledgerHtml(S) {
  const key = Math.ceil(S.day / 7);
  const rep = (k) => {
    const r = monthReport(S, k);
    const rows = Object.entries(r.m).sort((a, b) => a[1] - b[1]).map(([c, a]) => `<div class="prow${a < 0 ? ' neg' : ''}"><span>${CAT[c] || c}</span><span>${a < 0 ? '−' : '+'}${yen(Math.abs(a))}</span></div>`).join('');
    return `${rows || '<div class="dim">Chưa có giao dịch</div>'}<div class="prow net"><span>Thu ${yen(r.inc)} · Chi ${yen(-r.out)}</span><span>${yen(r.inc + r.out)}</span></div>`;
  };
  const tx = S.fin.tx.slice(0, 25).map((t) => `<li><span class="dim">Ngày ${t.d}</span> ${CAT[t.c] ? CAT[t.c].split(' ')[0] : ''} ${esc(t.m || CAT[t.c] || '')} <b class="${t.a < 0 ? 'neg' : 'pos'}">${t.a < 0 ? '−' : '+'}${yen(Math.abs(t.a))}</b></li>`).join('');
  const debts = S.fin.debts.filter((d) => d.status === 'active').map((d) => `<div class="prow"><span>${esc(d.lender)}</span><span>${d.currency === 'VND' ? vnd(d.balance) : yen(d.balance)}</span></div>`).join('');
  return `<div class="payslip"><div class="prow"><span>💴 Số dư</span><span><b>${yen(S.money)}</b></span></div></div>
    <h3>Tháng này (tháng ${month(S)})</h3><div class="payslip">${rep(key)}</div>
    ${key > 1 ? `<h3>Tháng trước</h3><div class="payslip">${rep(key - 1)}</div>` : ''}
    ${debts ? `<h3>Khoản nợ</h3><div class="payslip">${debts}</div>` : ''}
    <h3>Giao dịch gần đây</h3><ul class="log">${tx || '<li class="dim">Chưa có</li>'}</ul>`;
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
  for (const d of S.fin.debts.filter((x) => x.status === 'active' && x.due)) items.push(`💸 Nợ ${esc(d.lender)}: ${d.balance.toLocaleString('en-US')}¥ — hạn trả còn ${d.due - S.day} ngày`);
  items.push('⚽ Sáng Chủ Nhật: CLB bóng đá ở công viên · 🇻🇳 Chiều Chủ Nhật: hội người Việt');
  return `<ul class="log">${items.map((x) => `<li>${x}</li>`).join('')}</ul><p class="dim">Hôm nay: Năm ${year(S)}, ngày ${d}/${YEAR_DAYS} của năm.</p>`;
}
