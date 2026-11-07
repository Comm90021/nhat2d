// NPC chủ động tìm đến người chơi — xác suất theo quy luật trong rules.js (không viết sẵn ai làm gì).
import { applyFx, addLog, yen, clamp, MIDNIGHT } from '../state.js';
import { modal, chips, toast, esc } from '../ui.js';
import { PEOPLE, AI_PLACES } from './world.js';
import { PROACTIVE, rnd, repayChance } from './rules.js';
import { moodToday, adjustMood, stateAtHour, aiDayStart } from './sim.js';
import { P, gain, stageIdx, atLeast } from '../social.js';
import { pay, earn } from '../finance.js';
import { sfx } from '../audio.js';

const metIds = (S) => Object.keys(S.npc || {}).filter((id) => S.npc[id].met && PEOPLE[id] && PEOPLE[id].traits);
const moneyStress = (d) => Math.min(1, (d.traits.spd * 0.6 + (d.nat === 'vn' ? 0.3 : 0.1) + (d.bio && /nợ|vay/.test(d.bio.biMat || '') ? 0.4 : 0)));
const attraction = (S, id) => { const d = PEOPLE[id]; const pref = S.pref; return d.romance && d.gender === pref ? 30 + S.mood * 0.3 + S.health * 0.2 + (S.npc[id].aff - 50) * 0.5 : 0; };

// ---------- đầu ngày: tâm trạng NPC, tin đồn, thu nợ ----------
export function aiMorningMsgs(S, ctx) {
  const news = aiDayStart(S);
  const met = new Set(metIds(S));
  const relevant = news.filter((n) => [...met].some((id) => n.includes(PEOPLE[id].name)));
  for (const n of relevant.slice(0, 2)) ctx.msgs.push(`🗞️ ${n}`);
  // người quen nợ tiền mình
  for (const r of S.fin.receivables) {
    if (r.status !== 'open' || S.day < r.due) continue;
    const d = PEOPLE[r.npc];
    if (rnd(S.world.seed, S.day, r.npc, 'repay') < repayChance(d.traits, moneyStress(d))) {
      r.status = 'paid'; earn(S, r.amount, 'loan', `${d.name} trả nợ`); gain(S, r.npc, 4);
      ctx.msgs.push(`💸 ${d.name} trả lại bạn ${yen(r.amount)} đúng hẹn, còn gửi kèm hộp bánh cảm ơn.`);
    } else {
      r.tries = (r.tries || 0) + 1; r.due = S.day + 7;
      const p = P(S, r.npc);
      if (r.tries >= 3) { r.status = 'lost'; p.aff = clamp(p.aff - 10); p.owes = true; ctx.msgs.push(`😞 ${d.name} lại khất nợ ${yen(r.amount)} lần thứ 3 rồi lảng tránh bạn. Có lẽ khoản này khó đòi.`); }
      else { p.aff = clamp(p.aff - 2); ctx.msgs.push(`⏳ ${d.name} xin khất khoản nợ ${yen(r.amount)} thêm 1 tháng.`); }
    }
  }
}

// ---------- buổi sáng: tối đa một tình huống cần lựa chọn ----------
export async function aiProactive(S) {
  const ids = metIds(S);
  const order = ids.sort((a, b) => rnd(S.world.seed, S.day, a, 'ord') - rnd(S.world.seed, S.day, b, 'ord'));
  for (const id of order) {
    const d = PEOPLE[id], p = P(S, id), mood = moodToday(S, id);
    const ctx = { moneyStress: moneyStress(d), attraction: attraction(S, id) };
    for (const kind of ['quarrel', 'borrow', 'invite', 'crush', 'help']) {
      const R = PROACTIVE[kind];
      const prob = R.base * R.f(d.traits, p.aff, mood, ctx);
      if (rnd(S.world.seed, S.day, id, kind) >= prob) continue;
      if (kind === 'crush' && (S.love || p.crush)) continue;
      if (kind === 'borrow' && (S.fin.receivables.some((r) => r.npc === id && r.status === 'open') || p.aff < 25)) continue;
      await HANDLERS[kind](S, id, d, p);
      return 'stop';
    }
  }
  return null;
}

const HANDLERS = {
  async invite(S, id, d, p) {
    // chọn nơi hẹn theo sở thích: người Nhật thích ramen/izakaya, người Việt thích tụ tập
    const place = d.nat === 'jp' ? 'ramen' : rnd(S.day, id, 'pl') < 0.5 ? 'ramen' : 'park';
    const at = rnd(S.day, id, 'h') < 0.5 ? 19 : 18;
    const busy = stateAtHour(S, id, at).act === 'work';
    if (busy) return;
    const v = await modal({
      who: `📱 Tin nhắn từ ${d.name}`, title: '💬 Rủ đi chơi',
      text: `"Tối nay ${at}:00 ra ${AI_PLACES[place].name} không? ${d.nat === 'jp' ? 'Mình mời một bát ramen nhé!' : 'Có mấy đứa bạn nữa, vui lắm!'}"`,
      choices: [{ label: '👍 Đi chứ!', value: true, primary: true }, { label: '🙏 Hôm nay bận rồi', value: false }],
    });
    if (v) {
      S.today.appt = { id, place, at: at * 60, done: false };
      S.world.override = S.world.override || {};
      S.world.override[id] = { day: S.day, from: at, to: at + 2, act: 'social', place };
      toast(`📅 Hẹn ${d.name} lúc ${at}:00 ở ${AI_PLACES[place].name}`, 2600);
    } else { p.aff = clamp(p.aff - (d.traits.agr > 0.6 ? 0 : 1)); toast(`${d.name}: "Ừ, hôm khác nhé!"`); }
  },
  async borrow(S, id, d, p) {
    const amount = [10000, 20000, 30000][Math.floor(rnd(S.day, id, 'amt') * 3)];
    const reason = d.nat === 'vn' ? ['nhà ở quê có việc gấp', 'tháng này bị trừ lương', 'phải gửi tiền chữa bệnh cho mẹ', 'trót vay nóng, giờ bị đòi'][Math.floor(rnd(S.day, id, 'rs') * 4)] : ['xe hỏng phải sửa', 'tiêu quá tay tháng này', 'chưa đến ngày lương'][Math.floor(rnd(S.day, id, 'rs') * 3)];
    const v = await modal({
      who: `📱 ${d.name}`, title: '💸 Hỏi vay tiền',
      text: `"${esc(reason)}… cho mình mượn ${yen(amount)} được không? Tháng sau mình trả."<br><span class="dim">Bạn đang có ${yen(S.money)}. Người này ${d.traits.con > 0.6 ? 'có tiếng là đàng hoàng' : d.traits.con < 0.4 ? 'hay khất nợ, theo lời mấy người quen' : 'bạn chưa rõ lắm'}.</span>`,
      choices: [{ label: `Cho mượn ${yen(amount)}`, value: true, disabled: S.money < amount, reason: 'Không đủ tiền' }, { label: 'Từ chối khéo', value: false }],
    });
    if (v) {
      pay(S, amount, 'loan', `Cho ${d.name} mượn`);
      S.fin.receivables.push({ npc: id, amount, due: S.day + 7, status: 'open' });
      gain(S, id, 6); adjustMood(S, id, 15);
      addLog(S, `Cho ${d.name} mượn ${yen(amount)}`);
      await modal({ text: `${esc(d.name)} cảm ơn rối rít. Hẹn tháng sau trả.`, html: chips([['money', -amount], ['aff', 6]]) });
    } else {
      const loss = d.traits.agr > 0.6 ? 1 : 4;
      p.aff = clamp(p.aff - loss);
      await modal({ text: `${esc(d.name)}: "${d.traits.agr > 0.6 ? 'Không sao, mình hỏi người khác.' : 'Ừ… thôi được.'}"`, html: chips([['aff', -loss]]) });
    }
  },
  async quarrel(S, id, d, p) {
    const topic = ['bạn lỡ hẹn lần trước', 'một câu đùa của bạn', 'chuyện tiền điện chung', 'bạn "khoe" lương'][Math.floor(rnd(S.day, id, 'tp') * 4)];
    const v = await modal({
      who: d.name, title: '💢 Cãi nhau', text: `Hôm nay ${esc(d.name)} có vẻ rất cáu, gắt với bạn vì ${topic}.`,
      choices: [{ label: '🙏 Xin lỗi, hỏi han xem có chuyện gì', value: 'calm' }, { label: '😤 Cãi lại', value: 'fight' }],
    });
    if (v === 'calm') { const g = d.traits.agr > 0.4 ? 2 : -1; p.aff = clamp(p.aff + g); adjustMood(S, id, 10); await modal({ text: g > 0 ? `${esc(d.name)} dịu lại: "Xin lỗi, hôm nay mình bị sếp mắng nên bực…"` : `${esc(d.name)} vẫn hậm hực bỏ đi.`, html: chips([['aff', g]]) }); }
    else { p.aff = clamp(p.aff - 6); applyFx(S, { mood: -5 }); await modal({ text: 'Hai người to tiếng, ai cũng khó chịu cả ngày.', html: chips([['aff', -6], ['mood', -5]]) }); }
  },
  async crush(S, id, d, p) {
    p.crush = true;
    sfx('good');
    await modal({ who: `📱 ${d.name}`, title: '💓 Tin nhắn lúc nửa đêm', text: `${esc(d.name)} nhắn: "Ngủ chưa? … Không có gì, tự nhiên muốn nói chuyện với bạn."<br><span class="dim">Hình như ${esc(d.name)} có cảm tình với bạn. Tỏ tình lúc này dễ thành công hơn.</span>` });
  },
  async help(S, id, d, p) {
    const out = applyFx(S, S.full < 50 ? { full: 25, mood: 4 } : { mood: 6 });
    gain(S, id, 2);
    await modal({ who: d.name, title: '🎁 Quan tâm', text: S.full < 50 ? `${esc(d.name)} mang sang cho bạn hộp cơm tự nấu: "Thấy dạo này bạn gầy đi."` : `${esc(d.name)} nhắn hỏi thăm, gửi kèm một bài hát vui.`, html: chips(out) });
  },
};

// ---------- cuộc hẹn: đến đúng chỗ, đúng giờ ----------
export async function apptCheck(S, inPlace) {
  const a = S.today.appt;
  if (!a || a.done) return false;
  const d = PEOPLE[a.id];
  if (S.time > a.at + 120 && !a.done) {
    a.done = true;
    const p = P(S, a.id);
    p.aff = clamp(p.aff - 8); p.stoodUp = (p.stoodUp || 0) + 1;
    adjustMood(S, a.id, -20);
    await modal({ who: `📱 ${d.name}`, title: '😞 Lỡ hẹn', text: `"Mình đợi mãi mà không thấy bạn…" ${esc(d.name)} có vẻ rất buồn. Lỡ hẹn làm mất lòng tin.`, html: chips([['aff', -8]]) });
    return true;
  }
  if (inPlace === a.place && S.time >= a.at - 30) {
    a.done = true;
    const cost = a.place === 'ramen' ? 1200 : 500;
    const share = d.nat === 'jp' && rnd(S.day, a.id, 'treat') < 0.6;
    if (!share) pay(S, cost, 'social', `Đi chơi với ${d.name}`);
    gain(S, a.id, 8); adjustMood(S, a.id, 12);
    const out = applyFx(S, { mood: 10, full: a.place === 'ramen' ? 45 : 10 });
    if (!share) out.unshift(['money', -cost]);
    out.push(['aff', 8]);
    S.time = Math.min(MIDNIGHT - 30, S.time + 90);
    await modal({ who: d.name, title: '🍜 Đúng hẹn!', text: share ? `${esc(d.name)} nhất định không cho bạn trả tiền: 「今日は私のおごり！」 (Hôm nay mình mời!)` : `Hai người ăn uống, nói chuyện rôm rả. ${esc(d.name)} kể chuyện công việc, chuyện quê.`, html: chips(out) });
    return true;
  }
  return false;
}
