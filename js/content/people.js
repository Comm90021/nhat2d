// Danh sách nhân vật có thể kết bạn. Tất cả tên và tính cách đều hư cấu.
// place: nơi gặp ('map' = đứng ngoài đường; còn lại là id địa điểm)
// lines: câu thoại theo mức thân thiết [người lạ, quen biết, bạn bè, thân thiết]
const L = (hair, shirt, pants, skin, gender) => ({ hair, shirt, pants, skin, gender });

export const PEOPLE = {
  yamada: {
    name: 'Chị Yamada', role: 'Tổ trưởng ở chỗ làm', jp: true, gender: 'f', place: 'work', group: 'Chỗ làm',
    look: L('#3b2a20', '#4a7bb7', '#2f3a56', '#f1d3b5', 'f'),
    intro: 'Chị Yamada là tổ trưởng, nghiêm khắc nhưng công bằng. Chị để ý ai chăm chỉ, ai chỉ làm cho có.',
    lines: ['「仕事、慣れましたか？」 (Quen việc chưa?) — chị hỏi ngắn gọn.', 'Chị kể hồi mới vào công ty cũng hay bị mắng.', 'Chị dặn: "Có gì khó cứ hỏi chị, đừng giấu."', 'Chị cười: "Em là người chị tin tưởng nhất trong tổ đấy."'],
    likes: ['sweets', 'vncoffee'], perks: ['', '', 'Thỉnh thoảng gợi ý trong ca làm (loại bớt 1 đáp án sai)', 'Bảo lãnh, viết thư giới thiệu khi chuyển visa / lên TTS số 3'],
  },
  kimura: {
    name: 'Anh Kimura', role: 'Senpai người Nhật', jp: true, gender: 'm', place: 'map', group: 'Chỗ làm',
    look: L('#1e1a1a', '#5b6b3a', '#3d3d3d', '#eac39c', 'm'),
    intro: 'Anh Kimura ít nói, tay nghề giỏi nhất xưởng. Hết giờ anh hay đứng hút thuốc ở góc đường trước công ty.',
    lines: ['Anh gật đầu: 「お疲れ」.', 'Anh chỉ bạn một mẹo nhỏ để làm nhanh hơn mà vẫn an toàn.', 'Anh rủ cuối tuần đi câu cá, nói chuyện nhiều hơn hẳn.', 'Anh bảo: "Tay nghề mày giờ ngang tao rồi đấy."'],
    likes: ['beer', 'sweets'], perks: ['', '', 'Mỗi lần nói chuyện: tay nghề +1', 'Giới thiệu chỗ làm lương cao hơn khi bạn có visa Kỹ năng đặc định'],
  },
  sato: {
    name: 'Bà Sato', role: 'Hàng xóm', jp: true, gender: 'f', place: 'map', group: 'Hàng xóm',
    look: L('#d4d4da', '#8b6f9c', '#5a4a5e', '#f1d3b5', 'f'),
    intro: 'Bà Sato sống một mình cạnh ký túc xá, sáng nào cũng quét dọn trước cửa và chào mọi người.',
    lines: ['Bà cúi chào: 「おはよう」.', 'Bà hỏi thăm quê bạn ở đâu, có xa không.', 'Bà mang cho bạn ít rau nhà trồng.', 'Bà bảo coi bạn như cháu trong nhà.'],
    likes: ['flower', 'sweets'], perks: ['', '', 'Mang đồ ăn sang khi bạn ốm', 'Mời ăn Tết kiểu Nhật (おせち)'],
  },
  long: {
    name: 'Anh Long', role: 'Senpai người Việt, sang trước 2 năm', jp: false, gender: 'm', place: 'map', group: 'Cộng đồng Việt',
    look: L('#1e1a1a', '#3f88c5', '#2f3a56', '#e2b48c', 'm'),
    intro: 'Anh Long nhiệt tình, biết đủ thứ chuyện ở đây — từ chỗ mua đồ rẻ tới tin việc làm.',
    lines: ['"Ê em, mới sang à?"', 'Anh kể chuyện năm đầu bị trừ lương vì đi muộn.', 'Anh rủ cuối tuần qua phòng ăn lẩu.', 'Anh bảo: "Có chuyện gì cứ gọi anh, anh em xa quê cả."'],
    likes: ['beer', 'vncoffee'], perks: ['', 'Chia sẻ mẹo sống ở Nhật', 'Chỉ app chuyển tiền phí rẻ (phí còn ¥500)', 'Giúp đỡ khi bạn gặp chuyện, giới thiệu việc'],
  },
  ha: {
    name: 'Hà', role: 'TTS người Việt, ở cùng ký túc xá', jp: false, gender: 'f', place: 'dorm', group: 'Cộng đồng Việt', romance: true,
    look: L('#2b1d16', '#e86f8a', '#2f3a56', '#f0c9a6', 'f'),
    intro: 'Hà quê Nghệ An, làm ở xưởng may gần đây. Nấu ăn rất khéo, hay cười.',
    lines: ['Hà chào: "Anh/chị mới chuyển đến à?"', 'Hà kể nhớ mẹ, nhớ nồi canh cá quê.', 'Hà nấu dư một phần, để phần cho bạn.', 'Hà bảo ở đây có bạn nói chuyện thấy đỡ cô đơn hẳn.'],
    likes: ['flower', 'sweets'], perks: ['', '', 'Nấu ăn chung không cần nguyên liệu', 'Luôn động viên khi bạn buồn'],
  },
  tuan: {
    name: 'Tuấn', role: 'Du học sinh, làm ca tối ở konbini', jp: false, gender: 'm', place: 'konbini', group: 'Cộng đồng Việt', romance: true,
    look: L('#1e1a1a', '#2e8b57', '#3d3d3d', '#e2b48c', 'm'),
    intro: 'Tuấn học trường tiếng ở thành phố bên cạnh, tối làm thêm ở konbini (du học sinh được làm tối đa 28 giờ/tuần).',
    lines: ['Tuấn cười: "Hâm nóng không anh/chị?"', 'Tuấn kể học tiếng xong muốn thi vào đại học Nhật.', 'Tuấn để dành cho bạn mấy hộp cơm sắp hết hạn.', 'Tuấn nói chuyện với bạn tới tận lúc hết ca.'],
    likes: ['vncoffee', 'beer'], perks: ['', '', 'Thỉnh thoảng cho đồ ăn sắp hết hạn', 'Cùng bạn học tiếng Nhật'],
  },
  yui: {
    name: 'Yui', role: 'Tình nguyện viên trung tâm giao lưu', jp: true, gender: 'f', place: 'center', group: 'Giao lưu quốc tế', romance: true,
    look: L('#4a3326', '#f2c94c', '#6b7a8f', '#f6d7b8', 'f'),
    intro: 'Yui là nhân viên văn phòng, cuối tuần làm tình nguyện dạy tiếng Nhật. Cô rất thích đồ ăn Việt.',
    lines: ['「はじめまして、ゆいです」 — cô cúi chào lễ phép.', 'Yui hỏi bạn phở với bún chả khác nhau thế nào.', 'Yui rủ bạn đi ăn cơm cuối tuần.', 'Yui nói muốn một ngày được đến Việt Nam cùng bạn.'],
    likes: ['vncoffee', 'flower'], perks: ['', 'Học trao đổi ngôn ngữ: điểm học ×1.5', 'Học trao đổi ngôn ngữ: điểm học ×1.8', 'Giúp bạn ôn thi JLPT'],
  },
  kenta: {
    name: 'Kenta', role: 'Sinh viên Nhật học tiếng Việt', jp: true, gender: 'm', place: 'center', group: 'Giao lưu quốc tế', romance: true,
    look: L('#1e1a1a', '#e35d5b', '#2f3a56', '#f6d7b8', 'm'),
    intro: 'Kenta học năm 3 đại học, đang học tiếng Việt vì muốn làm việc ở Hà Nội.',
    lines: ['Kenta thử nói: "Xin chào! Tôi là Kenta."', 'Kenta nhờ bạn sửa phát âm tiếng Việt.', 'Kenta rủ bạn đi xem bóng chày.', 'Kenta bảo bạn là người bạn thân nhất của anh ở đây.'],
    likes: ['vncoffee', 'beer'], perks: ['', 'Học trao đổi ngôn ngữ: điểm học ×1.5', 'Học trao đổi ngôn ngữ: điểm học ×1.8', 'Giúp bạn ôn thi JLPT'],
  },
  mai: {
    name: 'Chị Mai', role: 'Kỹ sư người Việt (visa kỹ sư)', jp: false, gender: 'f', place: 'center', group: 'Cộng đồng Việt', romance: true,
    look: L('#1e1a1a', '#f1ece0', '#1f4e5f', '#f0c9a6', 'f'),
    intro: 'Mai tốt nghiệp đại học ở Việt Nam, sang Nhật làm kỹ sư cơ khí. Hay giúp người mới trong hội đồng hương.',
    lines: ['Mai chào: "Lần đầu đến hội à?"', 'Mai kể đã thi N2 ba lần mới đỗ.', 'Mai chỉ bạn cách tính lương, thuế, bảo hiểm.', 'Mai nói rất nể sự cố gắng của bạn.'],
    likes: ['flower', 'vncoffee'], perks: ['', 'Tư vấn thủ tục, giấy tờ', 'Mỗi lần nói chuyện: điểm tiếng Nhật thụ động', 'Giới thiệu chỗ làm tốt khi bạn có visa Kỹ năng đặc định'],
  },
  daiki: {
    name: 'Daiki', role: 'Đội trưởng CLB bóng đá', jp: true, gender: 'm', place: 'park', group: 'Câu lạc bộ',
    look: L('#3b2a20', '#1d4ed8', '#e5e7eb', '#eac39c', 'm'),
    intro: 'Daiki làm nghề sửa xe, sáng Chủ Nhật nào cũng tập hợp mọi người đá bóng ở công viên. Ai đến cũng được.',
    lines: ['「一緒にやる？」 (Chơi cùng không?)', 'Daiki khen bạn chạy nhanh.', 'Daiki rủ cả đội đi ăn ramen sau trận.', 'Daiki nói đội không thể thiếu bạn.'],
    likes: ['beer', 'sweets'], perks: ['', '', 'Đá bóng: sức khỏe tăng nhiều hơn', 'Giới thiệu việc ở xưởng sửa xe quen'],
  },
};

export const GIFTS = {
  sweets: { name: 'Hộp bánh kẹo Nhật (お菓子)', cost: 600 },
  vncoffee: { name: 'Cà phê phin Việt Nam', cost: 900 },
  beer: { name: 'Thùng bia nhỏ', cost: 1200 },
  flower: { name: 'Bó hoa', cost: 1500 },
};

export const STAGES = [
  { min: 0, name: 'Người lạ' },
  { min: 15, name: 'Quen biết' },
  { min: 40, name: 'Bạn bè' },
  { min: 70, name: 'Thân thiết' },
];
