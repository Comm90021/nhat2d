// Tình cảm: tỏ tình → hẹn hò → cầu hôn → ra mắt gia đình → kết hôn → con cái.
// Nội dung ở mức phù hợp mọi lứa tuổi.
import { applyFx, advance, addLog, clamp, yen, MIDNIGHT, YEAR_DAYS, dow } from './state.js';
import { modal, chips, toast, esc } from './ui.js';
import { PEOPLE, P, gain, stageIdx, hooks, affBar } from './social.js';
import { levelIndex } from './learning.js';
import { fam, famGain, famText } from './family.js';
import { VISAS } from './career.js';
import { sfx } from './audio.js';
import { pay } from './finance.js';

const PREG_DAYS = 63; // 9 tháng (7 ngày chơi = 1 tháng)
const NAMES_VN = ['An', 'Bình', 'Minh', 'Khang', 'Linh', 'Ngọc', 'Hân', 'Phúc'];
const NAMES_JP = ['Haruto', 'Sora', 'Yuna', 'Hina', 'Ren', 'Mio', 'Aoi', 'Kaito'];

export const partner = (S) => (S.love ? PEOPLE[S.love.id] : null);
export const isMarried = (S) => !!(S.love && S.love.stage === 'married');
const STAGE_TXT = { dating: 'Đang hẹn hò', engaged: 'Đã đính hôn', married: 'Vợ/chồng' };

function canRomance(S, id) {
  const d = PEOPLE[id];
  return d.romance && d.gender === (S.pref || (S.gender === 'm' ? 'f' : 'm'));
}

// Hành động tình cảm gắn vào menu của từng người
export function romanceActions(S, id) {
  const p = P(S, id), d = PEOPLE[id];
  const a = [];
  if (!p.met || !canRomance(S, id)) return a;
  if (!S.love && stageIdx(p.aff) >= 3) a.push({ label: `💗 Tỏ tình với ${d.name}`, sub: 'Thân thiết càng cao, càng dễ thành công', run: (s) => confess(s, id) });
  if (S.love && S.love.id === id) {
    a.push({ label: `💑 Hẹn hò với ${d.name}`, sub: STAGE_TXT[S.love.stage], minutes: 120, cond: (s) => (s.love.lastDate === s.day ? 'Hôm nay đã hẹn hò rồi' : null), run: (s) => date(s) });
    if (S.love.stage === 'dating' && S.day - S.love.since >= 42 && p.aff >= 85) a.push({ label: '💍 Cầu hôn', sub: 'Cần ¥150,000 (nhẫn, lễ ra mắt)', cond: (s) => (s.money < 150000 ? 'Chưa đủ tiền' : null), run: (s) => propose(s) });
    if (S.love.stage === 'engaged') a.push({ label: '📜 Đăng ký kết hôn & làm đám cưới nhỏ', sub: '婚姻届 · tiệc cưới ¥120,000', cond: (s) => (s.money < 120000 ? 'Chưa đủ tiền' : null), run: (s) => marry(s) });
    if (isMarried(S) && !S.love.pregnant && !S.love.wantKids) a.push({ label: '👶 Bàn chuyện sinh con', run: (s) => talkKids(s) });
  }
  return a;
}
hooks.extra = romanceActions;

async function confess(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  const chance = Math.min(0.95, 0.35 + (p.aff - 70) * 0.02 + (S.mood - 50) * 0.004 + (d.jp ? levelIndex(S.lang) * 0.04 : 0.05));
  await modal({ who: d.name, title: '💗 Tỏ tình', text: `Bạn hẹn ${esc(d.name)} ra bờ sông lúc hoàng hôn, lấy hết can đảm nói ra lòng mình${d.jp ? ': 「ずっと好きでした。付き合ってください」' : '.'}`, ok: 'Hồi hộp…' });
  advance(S, 60);
  if (Math.random() < chance) {
    S.love = { id, stage: 'dating', since: S.day, lastDate: S.day };
    gain(S, id, 5);
    addLog(S, `Bắt đầu hẹn hò với ${d.name}`);
    sfx('end');
    const out = applyFx(S, { mood: 25 });
    await modal({ who: d.name, title: '💞 Đồng ý!', text: `${esc(d.name)} đỏ mặt gật đầu${d.jp ? ': 「…はい。よろしくお願いします」' : ': "Mình cũng thích bạn từ lâu rồi."'}`, html: chips(out) });
  } else {
    p.aff = clamp(p.aff - 12);
    sfx('bad');
    const out = applyFx(S, { mood: -15 });
    await modal({ who: d.name, title: '💔 Chưa phải lúc', text: `${esc(d.name)} bối rối: "Mình… coi bạn là bạn tốt thôi. Cho mình thêm thời gian nhé." Có lẽ cần thân thiết hơn nữa.`, html: chips(out) });
  }
}

const DATES = [
  { label: '🌸 Dạo công viên, mua đồ ăn vặt', cost: 1500, aff: 4, mood: 8 },
  { label: '🍣 Ăn tối ở nhà hàng', cost: 5000, aff: 7, mood: 10 },
  { label: '🚃 Đi tàu lên thành phố chơi cả ngày', cost: 9000, aff: 10, mood: 14, weekend: true },
  { label: '🏠 Nấu ăn cùng nhau ở nhà', cost: 800, aff: 5, mood: 7 },
];
async function date(S) {
  const d = partner(S);
  const v = await modal({
    who: d.name, title: '💑 Đi đâu bây giờ?',
    choices: [...DATES.map((x, i) => ({ label: `${x.label} · ${yen(x.cost)}`, value: i, disabled: S.money < x.cost || (x.weekend && dow(S) < 5) || S.time + 120 > MIDNIGHT, reason: S.money < x.cost ? 'Không đủ tiền' : x.weekend && dow(S) < 5 ? 'Chỉ cuối tuần' : 'Khuya rồi' })), { label: 'Thôi', value: -1, cancel: true }],
  });
  if (v < 0) return;
  const x = DATES[v];
  pay(S, x.cost, 'date', 'Hẹn hò');
  advance(S, x.weekend ? 360 : 120);
  S.love.lastDate = S.day;
  gain(S, S.love.id, x.aff);
  const out = applyFx(S, { mood: x.mood, full: 20 });
  out.unshift(['money', -x.cost]);
  out.push(['aff', x.aff]);
  await modal({ who: d.name, title: '💕 Một buổi hẹn vui', text: 'Thời gian bên nhau trôi qua thật nhanh.', html: chips(out) + affBar(P(S, S.love.id).aff) });
}

async function propose(S) {
  const d = partner(S);
  pay(S, 150000, 'wedding', 'Nhẫn cầu hôn, lễ ra mắt');
  advance(S, 120);
  addLog(S, `Cầu hôn ${d.name}`);
  await modal({ who: d.name, title: '💍 Cầu hôn', text: `${esc(d.name)} bật khóc rồi gật đầu. Nhưng trước khi cưới còn phải ra mắt gia đình hai bên…`, html: chips([['money', -150000]]), ok: 'Ra mắt gia đình →' });
  // ra mắt gia đình mình (qua video)
  const f = fam(S);
  let ok = true;
  if (d.jp) {
    const v = await modal({
      who: 'Gọi video về quê', title: '👨‍👩‍👧 Bố mẹ bạn', text: `Bố mẹ lo lắng: "Lấy người Nhật thì sau này con ở luôn bên đó à? Bố mẹ già rồi ai chăm?"`,
      choices: [{ label: 'Hứa năm nào cũng đưa vợ/chồng về thăm, sau này sẽ đón bố mẹ sang chơi', value: 1 }, { label: '"Con lớn rồi, con tự quyết"', value: 0 }],
    });
    famGain(S, v ? 5 : -12);
    // ra mắt bố mẹ người Nhật: cần tiếng Nhật
    const jl = levelIndex(S.lang);
    const good = jl >= 3 || (jl >= 2 && Math.random() < 0.6);
    await modal({ who: `Bố mẹ ${d.name}`, title: '🍵 Ra mắt bố mẹ người Nhật', text: good ? 'Bạn chào hỏi bằng kính ngữ 「はじめまして。どうぞよろしくお願いいたします」, kể về công việc và kế hoạch tương lai. Bố của người ấy gật gù: 「しっかりした人だね」.' : 'Bạn nói tiếng Nhật còn lúng túng, bố của người ấy nhíu mày nhiều lần. Phải nhờ người yêu phiên dịch… Nhưng cuối cùng họ vẫn đồng ý vì thấy hai đứa thương nhau thật lòng.' });
    if (!good) applyFx(S, { mood: -5 });
  } else {
    await modal({ who: 'Gọi video hai gia đình', title: '👨‍👩‍👧 Ra mắt hai bên gia đình', text: 'Hai bên gia đình ở Việt Nam nói chuyện qua video, hẹn ngày gặp mặt ở quê. Mẹ bạn mừng ra mặt: "Thế là yên tâm rồi."' });
    famGain(S, 10);
  }
  if (ok) { S.love.stage = 'engaged'; S.love.engaged = S.day; }
  await modal({ title: '💍 Đã đính hôn', text: `Gia đình ở quê: ${famText(f.sat)}. Khi đủ tiền, hai người có thể đăng ký kết hôn (婚姻届) và làm đám cưới nhỏ.` });
}

async function marry(S) {
  const d = partner(S);
  pay(S, 120000, 'wedding', 'Đám cưới');
  advance(S, 300);
  S.love.stage = 'married';
  S.love.married = S.day;
  famGain(S, 15);
  addLog(S, `Kết hôn với ${d.name}`);
  sfx('end');
  const out = applyFx(S, { mood: 30 });
  let note = '';
  const myVisa = VISAS[S.career.visa];
  if (d.jp) note = 'Vì kết hôn với người Nhật, bạn có thể xin đổi sang <b>visa vợ/chồng người Nhật</b> (làm thủ tục ở ký túc xá → 📄). Visa này không giới hạn ngành nghề.';
  else if (!myVisa.family) note = `Thực tế: visa <b>${esc(myVisa.short)}</b> của bạn không được bảo lãnh gia đình. Hai người vẫn có visa riêng, nhưng nếu có con, bé sẽ không được ở Nhật trừ khi một trong hai có visa cho phép bảo lãnh (như visa kỹ sư, KNĐĐ số 2).`;
  else note = 'Visa của bạn cho phép bảo lãnh gia đình — sau này có con, bé có thể sống cùng bạn ở Nhật.';
  await modal({ who: 'Cột mốc', title: `💒 Kết hôn với ${d.name}!`, text: `Hai người nộp tờ 婚姻届 ở tòa thị chính rồi làm một bữa tiệc nhỏ với bạn bè ở hội người Việt và đồng nghiệp. ${note}`, html: chips([['money', -120000], ...out]) });
}

async function talkKids(S) {
  const v = await modal({ who: partner(S).name, title: '👶 Chuyện con cái', text: 'Hai người nói chuyện về việc có con: tiền bạc, visa, ai chăm…', choices: [{ label: 'Hai đứa muốn có con', value: true }, { label: 'Đợi ổn định hơn đã', value: false }] });
  if (v) { S.love.wantKids = S.day; toast('💞 Hai người quyết định sẽ có con khi duyên tới'); }
}

// Gọi mỗi ngày mới: hâm nóng / nguội tình cảm, mang thai, sinh con
export async function romanceDaily(S) {
  if (!S.love) return;
  const L = S.love, p = P(S, L.id), d = PEOPLE[L.id];
  // lâu không hẹn hò thì nguội dần
  if (L.stage !== 'married' && S.day - L.lastDate > 14 && S.day % 3 === 0) {
    p.aff = clamp(p.aff - 3);
    if (p.aff < 55) {
      addLog(S, `Chia tay ${d.name}`);
      S.love = null;
      const out = applyFx(S, { mood: -25 });
      await modal({ who: d.name, title: '💔 Chia tay', text: `"Dạo này bạn chẳng còn thời gian cho mình…" ${esc(d.name)} nói lời chia tay.`, html: chips(out) });
      return;
    }
  }
  if (L.stage === 'married' && S.day - L.lastDate > 21 && S.day % 4 === 0) p.aff = clamp(p.aff - 2);
  // mang thai
  if (L.stage === 'married' && L.wantKids && !L.pregnant && Math.random() < 0.07) {
    L.pregnant = { start: S.day };
    const me = S.gender === 'f';
    addLog(S, 'Có tin vui: mang thai');
    sfx('end');
    await modal({ who: 'Tin vui', title: '🤰 Có em bé rồi!', text: me
      ? 'Bạn có thai! Ở Nhật, phụ nữ mang thai được nhận sổ tay mẹ con (母子手帳) ở tòa thị chính, khám thai được hỗ trợ chi phí. Lao động nước ngoài — kể cả TTS — <b>được pháp luật bảo vệ</b>: công ty không được đuổi việc vì mang thai, và bạn được nghỉ thai sản (産休).'
      : `${esc(d.name)} có thai! Bạn sẽ làm bố. Từ giờ phải lo nhiều hơn rồi.` });
    if (me && ['tts1', 'tts2', 'tts3'].includes(S.career.visa)) {
      const v = await modal({
        who: 'Công ty', title: '⚠️ Áp lực từ công ty', text: 'Quản lý bóng gió: "Có thai thì làm sao làm việc được… hay là về nước đi?"',
        choices: [{ label: 'Bình tĩnh nói: theo luật, TTS mang thai được bảo vệ. Em sẽ hỏi nghiệp đoàn và OTIT.', value: 1 }, { label: 'Im lặng, lo lắng', value: 0 }],
      });
      if (v) { const out = applyFx(S, { mood: 3 }); await modal({ text: 'Nghiệp đoàn can thiệp, công ty xin lỗi và sắp xếp việc nhẹ hơn cho bạn. Biết luật là tự bảo vệ mình.', html: chips(out) }); }
      else { const out = applyFx(S, { mood: -15 }); await modal({ text: 'Bạn mất ngủ nhiều đêm. Hãy nhớ: đường dây tư vấn tiếng Việt của OTIT luôn sẵn sàng giúp bạn.', html: chips(out) }); }
    }
    return;
  }
  if (L.pregnant && S.day - L.pregnant.start >= PREG_DAYS) await birth(S);
}

async function birth(S) {
  const L = S.love, d = PEOPLE[L.id];
  L.pregnant = null;
  const names = d.jp ? NAMES_JP : NAMES_VN;
  const name = await modal({ who: 'Bệnh viện', title: '👶 Em bé chào đời!', text: 'Mẹ tròn con vuông. Chi phí sinh được bảo hiểm hỗ trợ (出産育児一時金). Đặt tên cho bé:', choices: names.slice(0, 6).map((n) => ({ label: n, value: n })) });
  // con ở đâu: cần ít nhất một người có visa cho phép bảo lãnh (hoặc vợ/chồng là người Nhật)
  const myVisa = VISAS[S.career.visa];
  const partnerAllows = d.jp || L.id === 'mai';
  let where = myVisa.family || partnerAllows ? 'jp' : 'vn';
  let txt;
  if (where === 'jp') txt = d.jp ? 'Bé có quốc tịch Nhật theo bố/mẹ, sống cùng hai bạn.' : 'Nhờ visa được phép bảo lãnh gia đình, bé được cấp tư cách lưu trú và sống cùng bạn ở Nhật.';
  else txt = 'Visa của cả hai không cho phép bảo lãnh con. Sau vài tháng, bé phải về quê cho ông bà nuôi — câu chuyện quen thuộc của rất nhiều gia đình lao động ở Nhật.';
  S.kids = S.kids || [];
  S.kids.push({ name, born: S.day, where, seen: S.day });
  famGain(S, 20);
  addLog(S, `Bé ${name} chào đời`);
  sfx('end');
  const out = applyFx(S, { mood: where === 'jp' ? 30 : 10 });
  await modal({ who: 'Cột mốc', title: `👶 Chào mừng bé ${esc(name)}!`, text: txt + '<br>Từ giờ mỗi tuần sẽ có chi phí nuôi con.', html: chips(out) });
  L.wantKids = null;
}

// Đổi sang visa vợ/chồng người Nhật
export function canSpouseVisa(S) { return isMarried(S) && partner(S).jp && !['spouse', 'pr'].includes(S.career.visa); }

export function loveHtml(S) {
  if (!S.love) return '<div class="dim">Chưa có người yêu.</div>';
  const d = partner(S);
  return `<div class="payslip"><div class="prow"><span>💞 ${esc(d.name)}</span><span>${STAGE_TXT[S.love.stage]}${S.love.pregnant ? ' · 🤰 đang mang thai' : ''}</span></div></div>`;
}
export { YEAR_DAYS };
