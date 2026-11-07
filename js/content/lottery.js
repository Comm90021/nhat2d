// Các loại vé số mô phỏng theo thị trường Nhật Bản (hoàn trả luật định dưới 50%, tiền trúng số miễn thuế).

export const LOTTERIES = [
  // prizes: danh sách giải, p = xác suất trúng mỗi vé, amount = tiền thưởng (¥). Giải loại trừ nhau (mỗi vé trúng tối đa 1 giải).
  {
    id: 'jumbo',
    name: 'Xổ số Jumbo Ước Mơ (ドリームジャンボ)',
    price: 300,
    prizes: [
      { name: 'Giải Đặc biệt', p: 0.00000005, amount: 700000000 },       // 1 vé / 20 triệu vé → E = 35 ¥
      { name: 'Giải Phụ đặc biệt', p: 0.00000010, amount: 150000000 },   // 2 vé liền kề / 20 triệu vé → E = 15 ¥
      { name: 'Giải Nhì', p: 0.00000050, amount: 10000000 },             // 10 vé / 20 triệu vé → E = 5 ¥
      { name: 'Giải Ba', p: 0.00000600, amount: 1000000 },               // 120 vé / 20 triệu vé → E = 6 ¥
      { name: 'Giải Tư', p: 0.00014000, amount: 50000 },                 // 2.800 vé / 20 triệu vé → E = 7 ¥
      { name: 'Giải Năm', p: 0.00100000, amount: 10000 },                // 20.000 vé / 20 triệu vé → E = 10 ¥
      { name: 'Giải Sáu', p: 0.01000000, amount: 3000 },                 // 200.000 vé / 20 triệu vé → E = 30 ¥
      { name: 'Giải Bảy (khuyến khích)', p: 0.10000000, amount: 300 },   // 2.000.000 vé / 20 triệu vé → E = 30 ¥
    ],
    when: 'Bán theo đợt lớn trong năm (Jumbo Mùa Hè, Jumbo Cuối Năm - 年末ジャンボ)',
    desc: 'Loại vé số truyền thống nổi tiếng nhất Nhật Bản. Cơ hội đổi đời thành triệu phú với giải thưởng lên tới hàng trăm triệu yên, nhưng tỷ lệ trúng độc đắc cực kỳ mong manh.',
    // Tổng E = 35 + 15 + 5 + 6 + 7 + 10 + 30 + 30 = 138 ¥/vé
    // hoàn trả ≈ 0.4600 (46.00%)
  },
  {
    id: 'loto',
    name: 'Xổ số chọn 6 số Mirai Loto (ロト6)',
    price: 200,
    prizes: [
      { name: 'Giải Nhất (trùng 6 số)', p: 0.00000016, amount: 200000000 },        // ~1 / 6.096.454 → E = 32.0 ¥
      { name: 'Giải Nhì (trùng 5 số + bonus)', p: 0.00000100, amount: 10000000 },  // ~6 / 6.096.454 → E = 10.0 ¥
      { name: 'Giải Ba (trùng 5 số)', p: 0.00003500, amount: 300000 },             // ~216 / 6.096.454 → E = 10.5 ¥
      { name: 'Giải Tư (trùng 4 số)', p: 0.00160000, amount: 7000 },               // ~9.990 / 6.096.454 → E = 11.2 ¥
      { name: 'Giải Năm (trùng 3 số)', p: 0.02700000, amount: 1000 },              // ~162.000 / 6.096.454 → E = 27.0 ¥
    ],
    when: 'Mở thưởng định kỳ 2 lần mỗi tuần (Thứ Hai & Thứ Năm)',
    desc: 'Tự tay chọn 6 con số may mắn từ 01 đến 43. Nếu không có ai trúng giải Nhất, tiền thưởng sẽ được cộng dồn (carry over) sang kỳ mở thưởng tiếp theo.',
    // Tổng E = 32.0 + 10.0 + 10.5 + 11.2 + 27.0 = 90.7 ¥/vé
    // hoàn trả ≈ 0.4535 (45.35%)
  },
  {
    id: 'scratch',
    name: 'Vé cào may mắn Kōfuku Scratch (スクラッチ)',
    price: 200,
    prizes: [
      { name: 'Giải Nhất', p: 0.00000400, amount: 3000000 },              // 2 vé / 500.000 vé → E = 12.0 ¥
      { name: 'Giải Nhì', p: 0.00010000, amount: 100000 },                // 50 vé / 500.000 vé → E = 10.0 ¥
      { name: 'Giải Ba', p: 0.00120000, amount: 10000 },                  // 600 vé / 500.000 vé → E = 12.0 ¥
      { name: 'Giải Tư', p: 0.03800000, amount: 1000 },                   // 19.000 vé / 500.000 vé → E = 38.0 ¥
      { name: 'Giải Năm (hoàn tiền vé)', p: 0.10000000, amount: 200 },    // 50.000 vé / 500.000 vé → E = 20.0 ¥
    ],
    when: 'Bán liên tục quanh năm tại các quầy vé số cạnh nhà ga và trung tâm mua sắm',
    desc: 'Cào lớp tráng bạc để biết kết quả trúng thưởng ngay tại chỗ. Tỷ lệ trúng giải nhỏ cao, thích hợp mua giải trí thư giãn nhanh sau giờ tan tầm.',
    // Tổng E = 12.0 + 10.0 + 12.0 + 38.0 + 20.0 = 92.0 ¥/vé
    // hoàn trả ≈ 0.4600 (46.00%)
  },
];
