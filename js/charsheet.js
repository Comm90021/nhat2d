// Bảng chỉ số nhân vật (phím C): mọi chỉ số chính, phụ, may mắn, tay nghề, sức hút, tín dụng —
// mỗi chỉ số kèm "ảnh hưởng tới / tăng bằng cách".
import { STAT_INFO, ATTR_KEYS, ensureAttr, luckOf, energyCap, yen, vnd, year, jpLevel, bestCert } from './state.js';
import { modal, esc } from './ui.js';
import { visaInfo, endText, skillRank } from './career.js';
import { workName, RANKS, monthlyPay } from './jobs.js';
import { netWorth } from './bank.js';
import { PEOPLE, stageIdx } from './social.js';
import { hackOn } from './hackflag.js';

const HOW = {
  health: ['Ốm đau, ngất, nhập viện', 'Ăn đủ, ngủ đủ, khám bệnh, trái cây'],
  energy: ['Làm việc, học, đi chơi đều tốn', 'Ngủ, chợp mắt, chờ nghỉ ngơi; thể lực cao thì trần năng lượng cao hơn'],
  full: ['Đói lâu thì mất sức khỏe, tâm trạng', 'Ăn ở konbini, siêu thị, tự nấu'],
  mood: ['Tâm trạng về 0 là suy sụp', 'Gọi về nhà, đi chơi, trò chuyện, tắm sentō'],
  rep: ['Uy tín về 0 là bị cho về nước; ảnh hưởng thăng chức, phỏng vấn', 'Đi làm đúng giờ, làm tốt ca, giúp đỡ người khác'],
  fit: ['Trần năng lượng, sức khỏe', 'Gym, chạy bộ, đá bóng, việc chân tay'],
  int: ['Tốc độ học tiếng Nhật, gợi ý khi thi chứng chỉ', 'Thư viện, đọc sách, học đều'],
  look: ['Ấn tượng đầu, rung động, phỏng vấn', 'Cắt tóc, mua quần áo, giữ gìn (giảm dần nếu bỏ bê)'],
  soc: ['Kết bạn, tỏ tình, phỏng vấn, trò chuyện hợp ý', 'Trò chuyện, karaoke, hẹn hò, đá bóng'],
  cook: ['Tự nấu ngon hơn, tiết kiệm', 'Nấu ăn ở nhà'],
  stress: ['Cao ≥ 75: mất sức khỏe, tâm trạng mỗi ngày', 'Giảm: sentō, nghỉ cuối tuần, đi chơi; tăng: thiếu tiền, thất nghiệp'],
  luck: ['Ốm đau, quẻ omikuji, phỏng vấn, tỏ tình, cầu hôn, bị phát hiện, mất tiền', 'Bùa omamori, lễ đầu năm, quẻ 大吉; giảm khi chuyển tiền chui'],
};
const bar = (v, color) => `<div class="pbar"><i style="width:${Math.max(0, Math.min(100, Math.round(v)))}%${color ? ';background:' + color : ''}"></i></div>`;
const row = (a, b) => `<div class="prow"><span>${a}</span><span>${b}</span></div>`;
const stat = (icon, label, v, max, how, color) => `<div class="prow"><span>${icon} ${label}</span><span><b>${Math.round(v)}</b>/${max}</span></div>${bar((v / max) * 100, color)}${how ? `<div class="dim small">↳ ${esc(how[0])}<br>⬆ ${esc(how[1])}</div>` : ''}`;

export const charmOf = (S) => { const A = ensureAttr(S); return Math.round(A.look * 0.45 + A.soc * 0.35 + S.mood * 0.2); };

export function charHtml(S) {
  const A = ensureAttr(S), F = S.fin;
  const age = (S.age || 22) + Math.floor((S.day - 1) / 84);
  const skill = (S.skill && S.skill[S.job]) || 0;
  const luck = luckOf(S), luckBuff = Math.round(luck - A.luck);
  const met = Object.values(S.npc || {}).filter((p) => p.met);
  const close = met.filter((p) => stageIdx(p.aff) >= 2).length;
  const main = ['health', 'energy', 'full', 'mood', 'rep'].map((k) => stat(STAT_INFO[k].icon, STAT_INFO[k].label, S[k], k === 'energy' ? energyCap(S) : 100, HOW[k], k === 'health' && S[k] < 35 ? '#e35d5b' : '')).join('');
  const sub = ATTR_KEYS.filter((k) => k !== 'luck').map((k) => stat(STAT_INFO[k].icon, STAT_INFO[k].label, A[k], 100, HOW[k], k === 'stress' ? '#e35d5b' : '')).join('');
  return `${hackOn(S) ? '<p class="hackpct">🛠️ Save này đã bật chế độ hack</p>' : ''}
  <h3>👤 Cơ bản</h3><div class="payslip">
    ${row('Tên', esc(S.name))}${row('Tuổi', age)}${row('Ở Nhật', `Năm ${year(S)} · ${S.day} ngày`)}
    ${row('🛂 Visa', `${esc(visaInfo(S).short || visaInfo(S).name)} · hết hạn ${endText(S)}`)}
    ${row('💼 Công việc', `${esc(workName(S))}${S.emp && S.emp.co ? ` · ${RANKS[S.emp.rank || 0]} · ~${yen(monthlyPay(S))}/tháng` : ''}`)}
    ${row('🗣️ Tiếng Nhật', `trình độ ${jpLevel(S)}${bestCert(S) ? ` · chứng chỉ ${bestCert(S)}` : ''}`)}
  </div>
  <h3>❤️ Chỉ số chính</h3><div class="payslip">${main}</div>
  <h3>📊 Chỉ số phụ</h3><div class="payslip">${sub}</div>
  <h3>🍀 Vận may & năng lực đặc biệt</h3><div class="payslip">
    ${stat('🍀', `May mắn${luckBuff ? ` (gốc ${Math.round(A.luck)}, bùa/quẻ ${luckBuff > 0 ? '+' : ''}${luckBuff})` : ''}`, luck, 100, HOW.luck, '#3fb26b')}
    ${stat('🛠️', `Tay nghề · ${skillRank(S)}`, Math.min(200, skill), 200, ['Lương (tối đa +15%), đánh giá ca, thi tay nghề', 'Làm ca tốt, anh Kimura chỉ mẹo'], '#d9a441')}
    ${stat('💖', 'Sức hút', charmOf(S), 100, ['Ấn tượng lần đầu, rung động khi hẹn hò', 'Tính từ ngoại hình, giao tiếp và tâm trạng'], '#ff6b9a')}
    ${stat('💳', 'Điểm tín dụng', (F.credit || 600) - 300, 550, ['Vay ngân hàng, thẻ tín dụng, thuê/mua nhà (sắp có)', 'Trả góp đúng hạn, trả nợ trước hạn; giảm khi trễ hạn, chuyển tiền chui'], '#5b8def')}
    <div class="dim small">Điểm tín dụng thực: ${F.credit || 600} (thang 300–850)</div>
  </div>
  <h3>💴 Tài chính</h3><div class="payslip">
    ${row('Tiền mặt', yen(F.cash))}${row('Tài khoản', yen(F.bank))}${row('Nợ ở quê', vnd(Math.max(0, S.debt)))}${row('Tài sản ròng', yen(netWorth(S)))}
  </div>
  <h3>💞 Quan hệ</h3><div class="payslip">
    ${row('Người quen', met.length)}${row('Thân thiết trở lên', close)}
    ${row('Người yêu', S.love ? `${esc(PEOPLE[S.love.id] ? PEOPLE[S.love.id].name : '?')} · ${{ dating: 'hẹn hò', engaged: 'đính hôn', married: 'vợ/chồng' }[S.love.stage] || ''}` : 'chưa có')}
    ${Object.keys(S.affairs || {}).length ? row('🤫 Quan hệ bí mật', Object.keys(S.affairs).map((id) => esc(PEOPLE[id] ? PEOPLE[id].name : id)).join(', ')) : ''}
    ${row('📜 Chứng chỉ', (S.certs || []).length ? (S.certs || []).map((c) => esc(c.type === 'JLPT' ? 'JLPT ' + c.lv : c.lv || c.id)).join(', ') : 'chưa có')}
  </div>`;
}

export async function openCharSheet(S) {
  await modal({ who: `Hồ sơ của ${S.name}`, title: '👤 Chỉ số nhân vật', html: charHtml(S), wide: true, ok: 'Đóng' });
}
