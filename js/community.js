// Sinh hoạt hội người Việt: giúp đỡ lẫn nhau… và cả những cám dỗ, lừa đảo.
import { applyFx, advance, addLog, yen } from './state.js';
import { modal, chips } from './ui.js';
import { gain, atLeast } from './social.js';
import { sfx } from './audio.js';

const SCAMS = [
  {
    id: 'loan', title: '💸 "Vay nóng" ', who: 'Anh Thắng (người mới gặp ở hội)',
    text: 'Anh Thắng kéo bạn ra góc: "Cần tiền gửi về không? Anh cho vay 50.000¥ ngay, tháng sau trả 80.000¥ thôi. Không cần giấy tờ."',
    yes: 'Vay 50.000¥', no: 'Từ chối',
    onYes: (S) => { S.money += 50000; S.loan = { due: S.day + 14, amount: 80000 }; addLog(S, 'Vay nóng 50.000¥ của anh Thắng'); return 'Bạn nhận 50.000¥. Lãi 60% chỉ sau 2 tuần… Đến hạn mà không trả, chuyện sẽ rất khó lường.'; },
    noText: 'Đúng đắn. Vay nóng lãi cắt cổ là bẫy nợ phổ biến với người lao động nước ngoài.',
  },
  {
    id: 'mlm', title: '📦 "Cơ hội làm giàu"', who: 'Chị Ngọc (giới thiệu là "chuyên viên kinh doanh")',
    text: 'Chị Ngọc mời bạn mua bộ thực phẩm chức năng 30.000¥: "Mua rồi rủ thêm 3 người là hoàn vốn, sau đó thu nhập thụ động mỗi tháng!"',
    yes: 'Góp 30.000¥', no: 'Từ chối',
    onYes: (S) => { S.money -= 30000; S.mood = Math.max(0, S.mood - 12); addLog(S, 'Mất 30.000¥ vì đa cấp'); return 'Bạn không rủ được ai, hàng thì không bán được. 30.000¥ coi như mất trắng — mô hình đa cấp chỉ người ở trên cùng có lời.'; },
    noText: '"Thu nhập thụ động" mà phải kéo người khác vào là dấu hiệu đa cấp. Bạn tránh được một cú lừa.',
  },
  {
    id: 'fakejob', title: '🧳 "Việc lương cao, bỏ công ty đi"', who: 'Một người tự xưng môi giới',
    text: 'Người này nói: "Bỏ công ty đi, ra ngoài anh tìm việc lương gấp đôi, không cần giấy tờ, trả tiền mặt."',
    yes: 'Nghe theo', no: 'Từ chối',
    onYes: (S) => { S.rep = Math.max(0, S.rep - 30); S.mood = Math.max(0, S.mood - 10); addLog(S, 'Suýt bỏ trốn theo môi giới chui'); return 'Bạn nghỉ không phép 2 ngày để "đi xem việc" — hóa ra là làm chui, không hợp đồng, không bảo hiểm. Bạn quay về và bị kỷ luật nặng. Bỏ trốn khỏi công ty sẽ khiến bạn mất tư cách lưu trú.'; },
    noText: 'Bỏ trốn khỏi nơi làm việc để đi làm chui có thể khiến bạn mất visa, bị bắt và trục xuất.',
  },
];

export async function community(S) {
  S.today.community = true;
  advance(S, 120);
  const goods = [
    'Mọi người góp mỗi người một món: nem rán, bánh xèo, gỏi cuốn. Ăn xong ai cũng thấy đỡ nhớ nhà.',
    'Một anh làm 10 năm ở Nhật chia sẻ cách khai thuế cuối năm và xin hoàn thuế người phụ thuộc.',
    'Hội quyên góp giúp một bạn TTS bị tai nạn lao động. Bạn góp một chút và thấy ấm lòng.',
    'Mấy chị bày cách làm hồ sơ chuyển sang visa Kỹ năng đặc định và những thứ cần chuẩn bị.',
  ];
  const out = applyFx(S, { mood: 8, full: 25, jp: 0.3 });
  gain(S, 'long', 2);
  if (atLeast(S, 'mai', 0)) gain(S, 'mai', 1);
  await modal({ who: 'Hội người Việt ở Hikari', title: '🇻🇳 Sinh hoạt hội đồng hương', text: goods[S.day % goods.length], html: chips(out) });
  // cám dỗ / lừa đảo
  S.scams = S.scams || {};
  const pool = SCAMS.filter((x) => !S.scams[x.id]);
  if (pool.length && Math.random() < 0.4) {
    const sc = pool[Math.floor(Math.random() * pool.length)];
    S.scams[sc.id] = true;
    const warn = atLeast(S, 'long', 2) || atLeast(S, 'mai', 2) ? '<br><span class="dim">💡 Anh Long / chị Mai nháy mắt ra hiệu: "Cẩn thận người này đấy."</span>' : '';
    const yes = await modal({
      who: sc.who, title: sc.title, text: sc.text + warn,
      choices: [{ label: sc.yes, value: true, disabled: sc.id === 'mlm' && S.money < 30000, reason: 'Không đủ tiền' }, { label: sc.no, value: false }],
    });
    if (yes) { sfx('bad'); await modal({ title: 'Hậu quả', text: sc.onYes(S) }); }
    else { const o = applyFx(S, { mood: 1 }); await modal({ title: '👍 Tỉnh táo', text: sc.noText, html: chips(o) }); }
  }
}

// Gọi mỗi sáng: đòi nợ vay nóng
export async function loanCheck(S) {
  if (!S.loan || S.day < S.loan.due) return;
  const L = S.loan;
  if (S.money >= L.amount) {
    S.money -= L.amount;
    S.loan = null;
    await modal({ who: 'Anh Thắng', title: '💸 Trả nợ vay nóng', text: `Bạn phải trả ${yen(L.amount)} cho khoản vay 50.000¥. Mất trắng 30.000¥ tiền lãi.`, html: chips([['money', -L.amount]]) });
  } else {
    S.loan.due = S.day + 7;
    S.loan.amount = Math.round(L.amount * 1.2);
    const out = applyFx(S, { mood: -20, health: -5 });
    await modal({ who: 'Tin nhắn đe dọa', title: '📵 Bị đòi nợ', text: `Bạn không đủ tiền trả. Khoản nợ tăng lên ${yen(S.loan.amount)}. Họ nhắn tin đe dọa sẽ đến công ty… Hãy báo cảnh sát (110) hoặc nghiệp đoàn nếu bị đe dọa.`, html: chips(out) });
  }
}
