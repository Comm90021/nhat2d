// Lịch: 1 năm = 12 tháng = 84 ngày chơi. Mỗi tuần (Thứ Hai → Chủ Nhật) = 1 tháng. Năm bắt đầu tháng 4.
export const YEAR_DAYS = 84;
export const DAYS_PER_MONTH = 7;
export const DAYS_PER_SEASON = 21;

export const doy = (S) => ((S.day - 1) % YEAR_DAYS) + 1;                    // 1..84
export const year = (S) => Math.floor((S.day - 1) / YEAR_DAYS) + 1;
export const monthIdxOf = (d) => Math.floor((d - 1) / DAYS_PER_MONTH);     // 0 = tháng 4 … 11 = tháng 3
export const monthOf = (d) => ((3 + monthIdxOf(d)) % 12) + 1;              // tháng hiển thị 1..12
export const month = (S) => monthOf(doy(S));
export const seasonIdx = (S) => Math.min(3, Math.floor((doy(S) - 1) / DAYS_PER_SEASON));
export const dow = (S) => (S.day - 1) % 7;                                  // 0 = Thứ Hai … 6 = Chủ Nhật
export const isMonthEnd = (S) => dow(S) === 6;
// doy của Chủ Nhật trong tháng m (1..12)
export const sundayOfMonth = (m) => (((m - 4 + 12) % 12) * DAYS_PER_MONTH) + 7;

// Ngày nghỉ chung (công ty đóng cửa): Golden Week, Obon, nghỉ Tết dương lịch
export const HOLIDAYS = {
  8: 'Golden Week', 9: 'Golden Week', 10: 'Golden Week',
  33: 'Nghỉ Obon', 34: 'Nghỉ Obon', 35: 'Nghỉ Obon',
  62: 'Nghỉ Tết dương lịch', 63: 'Nghỉ Tết dương lịch', 64: 'Nghỉ Tết dương lịch', 65: 'Nghỉ Tết dương lịch',
};
export const holidayName = (S) => HOLIDAYS[doy(S)] || null;
export const isWorkday = (S) => dow(S) < 5 && !HOLIDAYS[doy(S)];

// Quy đổi lịch cũ 56 ngày/năm → 84 ngày/năm
export const scaleDay = (d) => (typeof d === 'number' && d > 0 ? Math.max(1, Math.round(d * 1.5)) : d);
