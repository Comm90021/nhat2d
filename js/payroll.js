// Lương tháng (給与明細): mỗi Chủ Nhật = cuối tháng. Số liệu gần thực tế, làm tròn.
import { yen, seasonIdx, year, addLog } from './state.js';
import { deposit, bankPay } from './finance.js';
import { JOBS } from './data.js';
import { sfx } from './audio.js';
import { monthlyPay } from './jobs.js';

const RENT = { tts1: 20000, tts2: 20000, tts3: 20000, ssw1: 35000, ssw2: 38000, spouse: 45000, pr: 45000, eng: 50000 };

export function payslip(S) {
  const gross = Math.round(S.wage || 0);
  const visa = (S.career && S.career.visa) || 'tts1';
  const insurance = Math.round(gross * 0.15);                                  // 健康保険・厚生年金・雇用保険 ~15%
  const incomeTax = Math.round(Math.max(0, gross - insurance - 88000) * 0.05);   // 源泉徴収 (đơn giản hóa)
  const residentTax = year(S) >= 2 ? (visa.startsWith('tts') ? 5000 : 9000) : 0; // 住民税 tính trên thu nhập năm trước
  // nhà ở: ký túc xá công ty (trừ theo visa) / nhà thuê (家賃) / nhà sở hữu (phí quản lý, thuế nhà đất)
  const h = S.home;
  const rent = h ? (h.own ? h.fee || 0 : h.rent || 0) : S.flags.apartment ? 45000 : RENT[visa] || 20000;
  const rentLabel = h ? (h.own ? 'Phí quản lý · thuế nhà đất (管理費・固定資産税)' : 'Tiền thuê nhà (家賃)') : 'Tiền nhà (ký túc xá)';
  const si = seasonIdx(S);
  const utility = (si === 3 ? 13000 : si === 1 ? 11000 : 8500) + (h ? (h.lot ? 5000 : 2500) : 0);
  const living = 20000;                                                        // gia vị, xà phòng, điện thoại, đi lại…
  const rows = [
    ['Lương gộp (総支給)', gross, 'salary'],
    ['Bảo hiểm xã hội (社会保険)', -insurance, 'insurance'],
    ['Thuế thu nhập (所得税)', -incomeTax, 'tax'],
    ['Thuế cư trú (住民税)', -residentTax, 'tax'],
    [rentLabel, -rent, 'rent'],
    ['Điện · nước · gas', -utility, 'utility'],
    ['Sinh hoạt cơ bản trong tháng', -living, 'living'],
  ];
  return { rows, net: rows.reduce((a, r) => a + r[1], 0), days: S.workDays || 0, job: JOBS[S.job] };
}

export function payroll(S) {
  const P = payslip(S);
  // lương chuyển khoản vào tài khoản; bảo hiểm, thuế bị khấu trừ; tiền nhà, điện nước trừ tự động từ tài khoản
  for (const [label, amt, cat] of P.rows) {
    if (!amt) continue;
    if (amt > 0) deposit(S, amt, cat, label); else bankPay(S, -amt, cat, label);
  }
  S.wage = 0;
  S.workDays = 0;
  sfx('coin');
  addLog(S, `Lĩnh lương tháng: thực nhận ${yen(P.net)}`);
  const rows = P.rows.map(([l, a]) => `<div class="prow${a < 0 ? ' neg' : ''}"><span>${l}</span><span>${a < 0 ? '−' + yen(-a) : yen(a)}</span></div>`).join('');
  return `<div class="payslip"><b>🧾 Phiếu lương tháng (給与明細) · ${P.days} ngày công</b>${rows}<div class="prow net"><span>Còn lại sau chi phí cố định</span><span>${yen(P.net)}</span></div></div>`;
}

// Tiền công một ca (1 ngày chơi ≈ 1/5 tháng)
export const shiftRate = (S) => monthlyPay(S) / 5;
