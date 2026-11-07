// Đề thi trắc nghiệm các chứng chỉ nghề có thật ở Nhật Bản.
// Mỗi câu: [câu hỏi, [đáp án ĐÚNG ở vị trí 0, sai 1, sai 2, sai 3], giải thích 1-2 câu]

export const BOKI = [
  [
    'Trong phương pháp ghi sổ kép (複式簿記), khi mua hàng hóa 50.000 yên chưa trả tiền (mua chịu), bút toán chuẩn theo phương pháp 3 phân pháp (三分法) là gì?',
    [
      '(Nợ) 仕入 50.000 / (Có) 買掛金 50.000',
      '(Nợ) 買掛金 50.000 / (Có) 仕入 50.000',
      '(Nợ) 売掛金 50.000 / (Có) 現金 50.000',
      '(Nợ) 商品 50.000 / (Có) 未払金 50.000'
    ],
    'Mua hàng hóa ghi tăng chi phí mua vào (仕入 ở bên Nợ) và tăng nợ phải trả người bán (買掛金 ở bên Có).'
  ],
  [
    'Trong tài khoản chữ T của kế toán, các nghiệp vụ làm phát sinh "tăng tài sản" (資産の増加) luôn được ghi vào bên nào?',
    [
      'Ghi vào bên Nợ (bên trái - 借方)',
      'Ghi vào bên Có (bên phải - 貸方)',
      'Ghi vào cả hai bên Nợ và Có',
      'Ghi nhận linh hoạt tùy trường hợp cụ thể'
    ],
    'Theo nguyên tắc kế toán, bên Nợ (借方 - Kari-kata) ghi nhận tài sản tăng và chi phí tăng.'
  ],
  [
    'Phương trình cơ bản của Bảng cân đối kế toán (貸借対照表 - B/S) được biểu diễn bằng công thức nào?',
    [
      'Tài sản = Nợ phải trả + Vốn thuần (純資産)',
      'Tài sản = Doanh thu thuần - Chi phí kinh doanh',
      'Nợ phải trả = Tổng tài sản + Lợi nhuận ròng',
      'Vốn thuần = Tổng tài sản + Nợ phải trả ngân hàng'
    ],
    'Bảng cân đối kế toán thể hiện tình hình tài chính tại một thời điểm: Tổng tài sản luôn cân bằng với Nợ phải trả cộng Vốn thuần.'
  ],
  [
    'Tài khoản nào sau đây được phân loại vào nhóm "Nợ phải trả" (負債) trong bảng cân đối kế toán?',
    [
      'Tiền nhận trước của người mua (前受金)',
      'Tiền ứng trước cho người bán (前払金)',
      'Khoản phải thu của khách hàng (売掛金)',
      'Tiền gửi ngân hàng có kỳ hạn (定期預金)'
    ],
    '前受金 là tiền khách hàng trả trước cho dịch vụ/hàng hóa chưa giao, doanh nghiệp có nghĩa vụ thực hiện nên thuộc nhóm Nợ phải trả.'
  ],
  [
    'Trong Báo cáo kết quả kinh doanh (損益計算書 - P/L), khi tổng doanh thu (収益) lớn hơn tổng chi phí (費用), chênh lệch đó gọi là gì?',
    [
      'Lợi nhuận ròng trong kỳ (当期純利益)',
      'Lỗ ròng phát sinh trong kỳ (当期純損失)',
      'Vốn điều lệ đăng ký kinh doanh (資本金)',
      'Dự phòng nợ khó đòi cuối kỳ (貸倒引当金)'
    ],
    'Nếu doanh thu lớn hơn chi phí thì sinh ra lợi nhuận ròng (当期純利益); ngược lại nếu chi phí lớn hơn sẽ là lỗ ròng (当期純損失).'
  ],
  [
    'Khi doanh nghiệp rút 100.000 yên từ tài khoản ngân hàng thông thường (普通預金) về nhập quỹ tiền mặt (現金), bút toán ghi sổ là gì?',
    [
      '(Nợ) 現金 100.000 / (Có) 普通預金 100.000',
      '(Nợ) 普通預金 100.000 / (Có) 現金 100.000',
      '(Nợ) 当座預金 100.000 / (Có) 現金 100.000',
      '(Nợ) 現金 100.000 / (Có) 当座借越 100.000'
    ],
    'Tiền mặt trong quỹ tăng ghi bên Nợ (現金), tiền trong tài khoản gửi ngân hàng giảm ghi bên Có (普通預金).'
  ],
  [
    'Để có thể phát hành séc (小切手) thanh toán tiền hàng cho đối tác, doanh nghiệp bắt buộc phải mở loại tài khoản nào tại ngân hàng?',
    [
      'Tài khoản tiền gửi thanh toán (当座預金)',
      'Tài khoản tiền gửi thông thường (普通預金)',
      'Tài khoản tiền gửi tiết kiệm định kỳ (定期預金)',
      'Tài khoản tiền gửi tích lũy có kỳ hạn (積立預金)'
    ],
    'Ở Nhật, muốn phát hành séc (小切手) hoặc hối phiếu (手形) thì doanh nghiệp phải ký hợp đồng mở tài khoản 当座預金 (không sinh lãi).'
  ],
  [
    'Khi trích khấu hao tài sản cố định vào cuối kỳ kế toán theo phương pháp gián tiếp (間接法), bút toán ghi nhận là gì?',
    [
      '(Nợ) 減価償却費 / (Có) 減価償却累計額',
      '(Nợ) 減価償却累計額 / (Có) 減価償却費',
      '(Nợ) 減価償却費 / (Có) 車両運搬具',
      '(Nợ) 備品固定資産 / (Có) 減価償却累計額'
    ],
    'Phương pháp gián tiếp ghi nhận chi phí khấu hao bên Nợ (減価償却費) và tích lũy vào tài khoản hao mòn lũy kế bên Có (減価償却累計額).'
  ],
  [
    'Doanh nghiệp tính thuế tiêu thụ theo phương pháp ghi sổ riêng biệt (税抜方式). Khi trả trước tiền thuế tiêu thụ lúc mua hàng, số thuế đó ghi vào tài khoản nào?',
    [
      '仮払消費税 (Thuế tiêu thụ tạm trả)',
      '仮受消費税 (Thuế tiêu thụ tạm thu)',
      '未払消費税 (Thuế tiêu thụ chưa trả)',
      '租税公課 (Thuế và các khoản lệ phí)'
    ],
    'Khi mua hàng chịu thuế, tiền thuế trả trước ghi vào 仮払消費税 (Tài sản); khi bán hàng thu thuế ghi vào 仮受消費税 (Nợ phải trả).'
  ],
  [
    'Mục đích quan trọng nhất của việc lập Bảng cân đối thử (残高試算表 - T/B) vào cuối kỳ kế toán là gì?',
    [
      'Kiểm tra xem số liệu bên Nợ và bên Có có cân bằng không',
      'Xác định chính xác số thuế thu nhập doanh nghiệp phải nộp',
      'Thông báo chi tiết tình hình phân chia cổ tức cho cổ đông',
      'Tính toán mức lương thưởng bình quân hàng tháng cho nhân sự'
    ],
    '試算表 dùng để kiểm tra tính chính xác và cân đối số học giữa bên Nợ và bên Có của tất cả các tài khoản trước khi lập báo cáo tài chính.'
  ]
];

export const ITPASS = [
  [
    'Trong mô hình phân tích chiến lược SWOT của doanh nghiệp, chữ "O" viết tắt của từ nào và mang ý nghĩa gì?',
    [
      'Opportunities: Cơ hội thuận lợi từ môi trường bên ngoài',
      'Organization: Năng lực tổ chức bộ máy bên trong nội bộ',
      'Objectives: Mục tiêu kinh doanh ngắn hạn của công ty',
      'Operations: Quy trình vận hành sản xuất tại phân xưởng'
    ],
    'SWOT gồm Strengths (Điểm mạnh), Weaknesses (Điểm yếu), Opportunities (Cơ hội bên ngoài) và Threats (Thách thức bên ngoài).'
  ],
  [
    'Trong chu trình quản lý chất lượng và cải tiến liên tục PDCA, bước "C" (Check) có nội dung thực hiện là gì?',
    [
      'Đo lường, kiểm tra và đánh giá kết quả thực hiện',
      'Lập kế hoạch chi tiết cùng các mục tiêu ngân sách mới',
      'Triển khai các biện pháp xử lý triệt để những điểm tồn đọng',
      'Trực tiếp phân công nhân sự và bắt tay vào việc thực thi'
    ],
    'PDCA gồm Plan (Kế hoạch) -> Do (Thực hiện) -> Check (Kiểm tra, đánh giá) -> Act (Hành động cải tiến).'
  ],
  [
    'Trong 3 yếu tố cốt lõi của an toàn thông tin (CIA), tính "Khả dụng" (Availability / 可用性) được hiểu chính xác là gì?',
    [
      'Đảm bảo hệ thống và dữ liệu luôn sẵn sàng khi cần dùng',
      'Chỉ cho phép những người được cấp quyền mới được đọc thông tin',
      'Bảo vệ dữ liệu không bị sửa đổi trái phép hoặc sai lệch nội dung',
      'Mã hóa toàn bộ các tập tin gửi qua đường truyền internet công cộng'
    ],
    'CIA gồm Confidentiality (Cơ mật - chỉ người có quyền mới xem), Integrity (Toàn vẹn - không bị sửa đổi) và Availability (Khả dụng - luôn sẵn sàng sử dụng).'
  ],
  [
    'Kẻ gian đóng giả nhân viên hỗ trợ CNTT gọi điện hỏi mật khẩu, hoặc nhìn trộm qua vai nhân viên để ghi nhớ mã PIN. Kỹ thuật tấn công này gọi là gì?',
    [
      'Tấn công phi kỹ thuật (ソーシャルエンジニアリング)',
      'Tấn công từ chối dịch vụ phân tán (DDoS攻撃)',
      'Tấn công cài mã độc tống tiền (ランサムウェア)',
      'Tấn công chèn câu lệnh độc hại (SQLインジェクション)'
    ],
    'Social Engineering (kỹ nghệ xã hội) là phương thức lừa đảo, khai thác tâm lý hoặc sơ hở hành vi của con người thay vì bẻ khóa bằng kỹ thuật phần mềm.'
  ],
  [
    'Cam kết mức chất lượng dịch vụ SLA (Service Level Agreement) ký giữa đơn vị cung cấp dịch vụ CNTT và khách hàng thường quy định điều gì?',
    [
      'Chỉ số cam kết chất lượng dịch vụ (như tỷ lệ Uptime)',
      'Mức lương khởi điểm và phụ cấp dành riêng cho lập trình viên',
      'Danh sách toàn bộ ngôn ngữ lập trình được sử dụng để phát triển',
      'Quy định xử phạt vi phạm bản quyền giữa chính phủ các quốc gia'
    ],
    'SLA định lượng mức độ dịch vụ mà nhà cung cấp cam kết đạt được, ví dụ thời gian hệ thống vận hành liên tục đạt 99,9% (Uptime).'
  ],
  [
    'Cơ chế xác thực hai yếu tố (2要素認証 / 2FA) để tăng cường bảo mật đăng nhập yêu cầu kết hợp hai thành phần nào?',
    [
      'Hai yếu tố thuộc các nhóm khác nhau (tri thức, sở hữu, sinh trắc)',
      'Nhập liên tiếp hai mật khẩu chữ số phức tạp do người dùng tự đặt ra',
      'Yêu cầu xác nhận thông qua hai hòm thư điện tử cá nhân khác nhau',
      'Đăng nhập trên cùng một máy tính liên tục hai lần trong một ngày'
    ],
    '2FA phải kết hợp 2 trong 3 yếu tố khác nhóm: thứ bạn biết (mật khẩu), thứ bạn có (điện thoại/OTP) hoặc thứ thuộc về bạn (vân tay/khuôn mặt).'
  ],
  [
    'Dịch vụ cho phép người dùng truy cập và sử dụng trực tiếp các phần mềm ứng dụng qua mạng internet (như Gmail, Google Docs) thuộc mô hình nào?',
    [
      'SaaS (Software as a Service)',
      'IaaS (Infrastructure as a Service)',
      'PaaS (Platform as a Service)',
      'DaaS (Desktop as a Service)'
    ],
    'SaaS cung cấp ứng dụng hoàn chỉnh cho người dùng cuối; PaaS cung cấp nền tảng phát triển ứng dụng; IaaS cung cấp hạ tầng máy chủ và lưu trữ ảo.'
  ],
  [
    'Hệ thống phân giải tên miền DNS (Domain Name System) trên mạng Internet đóng vai trò chính là gì?',
    [
      'Chuyển đổi tên miền dạng chữ thành địa chỉ IP của máy chủ',
      'Tự động quét và diệt virus cho tất cả máy tính truy cập mạng',
      'Nén dung lượng các video và hình ảnh truyền tải qua đường truyền',
      'Cấp phát nguồn điện dự phòng liên tục cho hệ thống máy chủ mạng'
    ],
    'DNS giúp máy tính hiểu được các địa chỉ như "google.com" bằng cách phân giải nó thành địa chỉ IP (ví dụ 142.250.x.x) để định tuyến.'
  ],
  [
    'Trong sơ đồ mạng công việc PERT của quản lý dự án, "Đường găng" (Critical Path / クリティカルパス) biểu thị điều gì?',
    [
      'Chuỗi công việc dài nhất quyết định tiến độ hoàn thành dự án',
      'Khoảng thời gian dự phòng dài nhất có thể dùng để nghỉ ngơi',
      'Đường nối giữa các công việc có chi phí mua sắm thiết bị lớn nhất',
      'Tập hợp các nhiệm vụ phụ có thể cắt bỏ bớt nếu dự án thiếu người'
    ],
    'Đường găng là chuỗi nhiệm vụ không có thời gian nhàn rỗi (float = 0); bất kỳ sự chậm trễ nào trên đường găng đều làm chậm tiến độ toàn bộ dự án.'
  ],
  [
    'Giấy phép phần mềm nguồn mở OSS (Open Source Software) có đặc điểm căn bản nào sau đây?',
    [
      'Cho phép người dùng tự do xem, sửa đổi và phân phối mã nguồn',
      'Nghiêm cấm tuyệt đối việc chỉnh sửa mã nguồn dưới mọi hình thức',
      'Bắt buộc tất cả người sử dụng phần mềm phải trả tiền bản quyền mua',
      'Chỉ cho phép cơ quan nhà nước và trường đại học lớn được sử dụng'
    ],
    'OSS công khai mã nguồn để cộng đồng tự do nghiên cứu, cải tiến và tái phân phối theo các điều khoản giấy phép (như MIT, GPL, Apache).'
  ]
];

export const BJT = [
  [
    'Khi viết email giao dịch gửi cho khách hàng hoặc công ty đối tác bên ngoài, từ xưng hô trang trọng để chỉ công ty của họ là gì?',
    [
      '貴社 (きしゃ)',
      '弊社 (へいしゃ)',
      '御社 (おんしゃ)',
      '当社 (とうしゃ)'
    ],
    'Trong văn bản/email gửi đối tác dùng 貴社 (きしゃ); khi trò chuyện trực tiếp dùng 御社 (おんしゃ); còn 弊社/当社 là để tự xưng công ty mình.'
  ],
  [
    'Khi muốn mời khách hàng hoặc đối tác xem qua một tập tài liệu giới thiệu sản phẩm, câu nói chuẩn mực kính ngữ (尊敬語) là gì?',
    [
      '「こちらの資料をご覧いただけますでしょうか」',
      '「こちらの資料を拝見していただけますでしょうか」',
      '「こちらの資料を見ていただけないでしょうか」',
      '「こちらの資料をご確認させてもらいますか」'
    ],
    'Xem (見る) nâng lên kính ngữ dành cho đối tác là ご覧になる. 拝見する là khiêm nhường ngữ (dành cho bản thân mình xem), dùng cho khách là sai kính ngữ.'
  ],
  [
    'Đối tác ngoài công ty gọi điện đến hỏi gặp Trưởng phòng Yamada của bạn. Khi sếp Yamada đang vắng mặt, câu trả lời đúng phép tắc là gì?',
    [
      '「山田はただいま席を外しております」',
      '「山田部長はただいま外出しておられます」',
      '「山田様はただいま席を外していらっしゃいます」',
      '「部長の山田様はもうすぐ戻られる予定です」'
    ],
    'Với quy tắc trong - ngoài (内外), khi nói về người cùng công ty với người ngoài thì không thêm chức danh hay kính ngữ (-sama, -san, -oraremasu) mà gọi thẳng họ.'
  ],
  [
    'Trong văn hóa trao đổi danh thiếp (名刺交換) ở Nhật Bản, quy tắc cơ bản khi hai bên cùng đưa danh thiếp cho nhau là gì?',
    [
      'Đưa danh thiếp ở độ cao thấp hơn đối phương một chút',
      'Luôn chờ đối tác trao danh thiếp trước rồi mới rút hộp ra',
      'Dùng một tay nhận nhanh danh thiếp rồi cất ngay vào túi áo',
      'Dùng bút ghi chú ngay số điện thoại riêng lên mặt danh thiếp'
    ],
    'Người ở vị trí thấp hơn (bên bán, cấp dưới) đưa danh thiếp trước và hạ thấp hơn một chút, cầm bằng 2 tay khi trao nhận và trân trọng để trên hộp danh thiếp.'
  ],
  [
    'Trong phòng họp tiêu chuẩn của công ty Nhật Bản, vị trí "ghế trên" (上座 - Kamiza) dành cho khách quý thường nằm ở đâu?',
    [
      'Vị trí ở sâu phía trong cùng, cách xa cửa ra vào nhất',
      'Vị trí ở ngay sát cạnh cửa ra vào để tiện đi vệ sinh',
      'Bất kỳ chiếc ghế nào xoay lưng lại với cửa sổ phòng họp',
      'Chiếc ghế kê chính giữa đối diện với bảng thuyết trình'
    ],
    'Ghế trong cùng xa cửa nhất là 上座 (Kamiza - an toàn, yên tĩnh, ấm cúng nhất); ghế sát cửa ra vào là 下座 (Shimoza) dành cho người mới hoặc cấp dưới.'
  ],
  [
    'Khi nghe điện thoại bàn tại công ty, nếu người gọi muốn gặp đồng nghiệp A nhưng người này đang bận cuộc gọi khác, bạn nên nói thế nào?',
    [
      '「あいにく〇〇は別の電話に出ております」',
      '「〇〇さんは今電話で忙しいので待ってください」',
      '「〇〇は電話中ですから後でかけ直してください」',
      '「今手が離せませんので要件を簡単にお願いします」'
    ],
    'Dùng từ đệm あいにく (rất tiếc) và cấu trúc 別の電話に出ております để thông báo lịch sự, sau đó đề nghị xin lại số gọi lại hoặc nhận lời nhắn.'
  ],
  [
    'Khi tiếp nhận chỉ thị từ cấp trên hoặc xác nhận yêu cầu công việc từ khách hàng, câu nói thể hiện sự tiếp nhận chuẩn mực và trang trọng nhất là gì?',
    [
      '「かしこまりました」（hoặc 「承知いたしました」）',
      '「了解いたしました」（hoặc 「了解です」）',
      '「わかりました」（hoặc 「わかっています」）',
      '「ご苦労様でした」（hoặc 「ご苦労様です」）'
    ],
    'かしこまりました / 承知いたしました là câu chuẩn với khách hàng và cấp trên. 了解しました thường dùng ngang hàng, còn ご苦労様 dùng cho cấp trên nói với cấp dưới.'
  ],
  [
    'Trong thư từ thương mại, khi buộc phải từ chối một yêu cầu giảm giá hoặc đề nghị hợp tác của đối tác, cụm từ đệm (クッション言葉) thích hợp nhất là gì?',
    [
      '「大変心苦しいのですが」',
      '「絶対に無理なのですが」',
      '「どうでもいいことですが」',
      '「お断り申し上げますので」'
    ],
    'Cụm từ đệm như 大変心苦しいのですが (Chúng tôi rất áy náy nhưng...), 誠に恐縮ですが giúp làm mềm lời từ chối, duy trì quan hệ đối tác hòa nhã.'
  ],
  [
    'Khi đến công ty đối tác để tham gia cuộc họp đã hẹn trước vào lúc 14:00, bạn nên có mặt tại quầy lễ tân vào thời điểm nào là chuẩn mực nhất?',
    [
      'Đến trước giờ hẹn khoảng 5 đến 10 phút',
      'Đến trước giờ hẹn đúng 45 phút cho yên tâm',
      'Đến muộn khoảng 5 phút để đối tác chuẩn bị',
      'Bước vào quầy lễ tân đúng từng giây giờ hẹn'
    ],
    'Văn hóa kinh doanh Nhật Bản coi việc đến trước 5-10 phút là chuẩn mực; đến quá sớm (trên 15-20 phút) sẽ gây bất tiện cho đối tác vì họ chưa chuẩn bị xong phòng họp.'
  ],
  [
    'Khi muốn trình bày với khách hàng: "Như tôi đã giải thích trong buổi trao đổi hôm trước...", bạn nên dùng từ khiêm nhường ngữ nào cho hành động "nói/giải thích"?',
    [
      '「先日申し上げましたとおり」',
      '「先日おっしゃいましたとおり」',
      '「先日言われましたとおり」',
      '「先日話してあげましたとおり」'
    ],
    'Khi nói về hành động của bản thân mình (tôi đã nói), phải dùng khiêm nhường ngữ 申す / 申し上げる. おっしゃる và 言われる là kính ngữ dành cho hành động của đối phương.'
  ]
];

export const TAKKEN = [
  [
    'Theo Luật Kinh doanh Bất động sản Nhật Bản, ai là người bắt buộc phải giải thích nội dung quan trọng (重要事項説明) cho người mua hoặc người thuê nhà?',
    [
      'Chuyên viên bất động sản có chứng chỉ (宅地建物取引士)',
      'Giám đốc đại diện pháp luật của công ty môi giới nhà đất',
      'Chủ nhà hoặc người trực tiếp đứng tên sở hữu bất động sản',
      'Bất kỳ nhân viên tư vấn bán hàng nào của văn phòng môi giới'
    ],
    'Việc giải thích các điều khoản quan trọng (bản thuyết minh điều 35) là nghiệp vụ độc quyền, bắt buộc phải do 宅地建物取引士 (Takken-shi) trực tiếp thực hiện.'
  ],
  [
    'Thời điểm bắt buộc công ty môi giới phải tiến hành giải thích bảng nội dung quan trọng (35条書面) cho khách hàng thuê hoặc mua nhà là khi nào?',
    [
      'Trước khi các bên ký kết hợp đồng và trước khi khách trả tiền cọc',
      'Sau khi người mua hoặc người thuê đã chuyển vào sinh sống ổn định',
      'Vào ngày hết hạn hợp đồng thuê nhà sau hai năm sinh sống tại đó',
      'Bất kỳ lúc nào thuận tiện trong vòng một tháng sau khi nhận nhà'
    ],
    'Mục đích của bảng giải thích quan trọng là để khách hiểu rõ mọi thông tin pháp lý, hiện trạng nhà trước khi quyết định ký hợp đồng hoặc trả tiền cọc.'
  ],
  [
    'Trong hợp đồng thuê nhà ở thông thường (普通借家契約) theo Luật thuê đất thuê nhà, khi hết thời hạn hợp đồng, quyền lợi của người thuê được bảo vệ thế nào?',
    [
      'Chủ nhà không thể từ chối gia hạn nếu không có lý do chính đáng',
      'Chủ nhà có quyền đòi lại nhà bất cứ lúc nào mà không cần giải thích',
      'Hợp đồng sẽ tự động chấm dứt vĩnh viễn và người thuê phải chuyển đi',
      'Người thuê phải nộp phạt gấp ba lần tiền cọc nếu muốn tiếp tục thuê'
    ],
    'Luật bảo vệ người thuê rất chặt chẽ; chủ nhà muốn từ chối gia hạn 普通借家契約 phải có lý do chính đáng thực sự cấp thiết (正当事由) và thường phải trả phí bồi thường.'
  ],
  [
    'Khoản tiền đặt cọc thuê nhà (敷金 - Shikikin) mà người thuê nộp cho chủ nhà khi bắt đầu ký hợp đồng có bản chất pháp lý là gì?',
    [
      'Tiền bảo đảm nợ, sẽ được trả lại sau khi trừ chi phí hư hại',
      'Khoản tiền biếu tặng cảm ơn chủ nhà mà người thuê không lấy lại',
      'Khoản phí nộp cho cơ quan thuế địa phương để đăng ký tạm trú',
      'Tiền thù lao trả cho nhân viên môi giới đã dẫn khách đi xem nhà'
    ],
    '敷金 là tiền đặt cọc đảm bảo cho các khoản nợ tiền nhà hoặc chi phí sửa chữa hư hại do người thuê gây ra; khi trả nhà số tiền dư sẽ được hoàn lại cho người thuê.'
  ],
  [
    'Theo quy định về quyền hủy hợp đồng không điều kiện (クーリング・オフ - Cooling-off) khi mua BĐS của công ty kinh doanh, thời hạn áp dụng thông thường là bao lâu?',
    [
      'Trong vòng 8 ngày kể từ ngày nhận thông báo bằng văn bản',
      'Trong vòng 30 ngày kể từ ngày chuyển vào sinh sống tại nhà',
      'Trong vòng 24 giờ kể từ thời điểm ký kết xong bản hợp đồng',
      'Trong suốt thời gian bảo hành công trình kéo dài mười năm'
    ],
    'Nếu ký hợp đồng tại địa điểm ngoài văn phòng giao dịch của bên bán (như quán cafe, tại nhà), người mua có quyền hủy hợp đồng vô điều kiện trong vòng 8 ngày bằng văn bản.'
  ],
  [
    'Luật Kinh doanh Bất động sản quy định mức trần phí môi giới (仲介手数料) tối đa mà công ty nhà đất được phép thu của khách hàng nhằm mục đích gì?',
    [
      'Bảo vệ khách hàng, ngăn chặn công ty môi giới thu phí quá cao',
      'Ép buộc tất cả các công ty nhà đất phải duy trì lợi nhuận cố định',
      'Đảm bảo nguồn thu tiền thuế tối đa cho ngân sách nhà nước địa phương',
      'Khuyến khích các nhà đầu tư nước ngoài mua thật nhiều đất nông nghiệp'
    ],
    'Quy định mức trần thù lao môi giới (ví dụ 3% + 60.000 yên đối với giao dịch trên 4 triệu yên) nhằm bảo vệ người tiêu dùng khỏi bị chèn ép, trục lợi giá cao.'
  ],
  [
    'Khi chủ nhà ký hợp đồng dịch vụ môi giới bán nhà dạng "Độc quyền chuyên trách" (専属専任媒介契約) với một công ty BĐS, điều kiện ràng buộc là gì?',
    [
      'Chủ nhà không được ký với công ty khác và không được tự tìm khách bán',
      'Chủ nhà được tự do ký gửi bán cùng lúc tại nhiều công ty bất động sản',
      'Công ty môi giới không cần phải báo cáo tiến độ tìm khách cho chủ nhà',
      'Hợp đồng có thời hạn vĩnh viễn suốt đời và không có điều kiện chấm dứt'
    ],
    '専属専任媒介契約 là hình thức độc quyền cao nhất: chỉ giao cho 1 công ty, chủ nhà tự tìm thấy người mua cũng không được tự giao dịch trực tiếp mà phải thông qua công ty đó.'
  ],
  [
    'Ngay sau khi các bên ký kết hợp đồng mua bán hoặc hợp đồng thuê nhà, công ty BĐS có nghĩa vụ lập và giao văn bản nào sau đây (theo Điều 37 Luật BĐS)?',
    [
      'Văn bản hợp đồng (37条書面) có chữ ký của chuyên viên BĐS',
      'Sổ đỏ và giấy chứng nhận sở hữu đất bản gốc cho người thuê',
      'Bản báo cáo quyết toán thuế thu nhập cá nhân chi tiết cả năm',
      'Hóa đơn thanh toán tiền điện nước và internet của tháng đầu'
    ],
    'Theo Điều 37 (37条書面), văn bản xác nhận giao kết hợp đồng phải được lập, có xác nhận của Takken-shi và giao ngay cho các bên liên quan sau khi hợp đồng được xác lập.'
  ],
  [
    'Khoản tiền "Lễ" (礼金 - Reikin) mà người thuê nhà ở Nhật Bản thường phải trả cho chủ nhà khi ký hợp đồng có đặc điểm gì?',
    [
      'Là tiền cảm ơn chủ nhà và không được hoàn lại khi trả phòng',
      'Là tiền gửi tạm thời và sẽ được hoàn lại nguyên vẹn khi dọn đi',
      'Là khoản phí bắt buộc phải nộp hàng tháng kèm theo tiền nhà ở',
      'Là tiền dùng riêng để trả chi phí tiền nước sinh hoạt cho cả năm'
    ],
    '礼金 (tiền lễ/tiền cảm ơn) là nét tập quán lâu đời ở Nhật, mang tính chất quà cảm ơn chủ nhà đã cho thuê, người thuê sẽ không nhận lại khoản này khi rời đi.'
  ],
  [
    'Theo quy chuẩn về nghĩa vụ khôi phục hiện trạng (原状回復) khi trả nhà thuê, những hư hao tự nhiên theo thời gian (経年劣化, ví dụ giấy dán tường ngả màu tự nhiên) do ai chịu chi phí?',
    [
      'Do chủ nhà (賃貸人) chịu, không trừ vào tiền cọc của người thuê',
      'Do người thuê nhà (賃借人) bắt buộc phải bỏ tiền túi ra thay mới',
      'Do công ty môi giới nhà đất chịu trách nhiệm chi trả toàn bộ',
      'Người thuê nhà kế tiếp chuyển đến ở sẽ phải gánh chịu khoản này'
    ],
    'Theo hướng dẫn của Bộ Đất đai Giao thông Nhật (MLIT), hao mòn tự nhiên và hao mòn thông thường do sử dụng hợp lý được tính vào tiền thuê hàng tháng, chủ nhà phải chịu.'
  ]
];

export const KIKEN = [
  [
    'Trong phân loại chất nguy hiểm theo Luật Phòng cháy chữa cháy Nhật Bản, các chất thuộc Nhóm 4 (第4類危険物) có tính chất đặc trưng chung là gì?',
    [
      'Chất lỏng dễ cháy (引火性液体)',
      'Chất rắn dễ cháy (可燃性固体)',
      'Chất tự bốc cháy (自然発火性物質)',
      'Khí nén độc hại (高圧毒性ガス)'
    ],
    'Nhóm 4 là nhóm phổ biến nhất bao gồm các chất lỏng dễ cháy như xăng, dầu hỏa, dầu diesel, cồn, dầu nặng, v.v.'
  ],
  [
    'Khái niệm "Điểm chớp cháy" (引火点 - Flash point) của một chất lỏng dễ cháy được định nghĩa chính xác là gì?',
    [
      'Nhiệt độ thấp nhất mà chất lỏng bốc đủ hơi để bắt lửa khi gặp mồi lửa',
      'Nhiệt độ cao nhất mà chất lỏng duy trì được trạng thái lỏng ổn định',
      'Nhiệt độ mà tại đó chất lỏng tự bốc cháy trong không khí không cần mồi',
      'Nhiệt độ sôi hoàn toàn khiến chất lỏng bay hơi hết trong thời gian ngắn'
    ],
    '引火点 là nhiệt độ thấp nhất sinh ra đủ hơi dễ cháy để bốc cháy khi có mồi lửa (khác với 発火点 là nhiệt độ tự bốc cháy không cần mồi lửa).'
  ],
  [
    'Hơi của hầu hết các chất lỏng dễ cháy Nhóm 4 (như xăng, dầu hỏa, dung môi hữu cơ) khi so sánh với không khí thì có đặc tính gì?',
    [
      'Nặng hơn không khí, có xu hướng chìm xuống và tích tụ ở chỗ trũng',
      'Nhẹ hơn không khí, luôn bay nhanh lên cao và phân tán vào khí quyển',
      'Có khối lượng bằng không khí nên luôn khuếch tán đồng đều mọi nơi',
      'Tự động ngưng tụ thành hạt nước rơi xuống sàn khi gặp ánh sáng nắng'
    ],
    'Tỷ trọng hơi của chất lỏng nhóm 4 lớn hơn không khí (xăng nặng hơn khoảng 3-4 lần), nên hơi xăng dễ tích tụ ở hố ga, mặt sàn, cực kỳ nguy hiểm nếu gặp tia lửa.'
  ],
  [
    'Đa số các chất lỏng thuộc Nhóm 4 (như xăng, dầu hỏa, dầu diesel) có đặc tính vật lý nào khi tiếp xúc với nước thông thường?',
    [
      'Nhẹ hơn nước và hầu như không tan trong nước (nổi trên mặt nước)',
      'Nặng hơn nước rất nhiều và lập tức chìm xuống đáy thùng khi gặp nước',
      'Dễ dàng hòa tan hoàn toàn vào nước tạo thành dung dịch lỏng đồng nhất',
      'Lập tức phản ứng hóa học dữ dội với nước sinh ra khí hydro gây nổ lớn'
    ],
    'Hầu hết chất lỏng nhóm 4 có tỷ trọng nhỏ hơn 1 (nhẹ hơn nước) và không tan trong nước, nên xăng dầu sẽ nổi trên mặt nước.'
  ],
  [
    'Khi xảy ra sự cố hỏa hoạn do xăng dầu bị tràn ra mặt đất bốc cháy, tại sao tuyệt đối KHÔNG được dùng nước xối thẳng vào đám cháy?',
    [
      'Xăng dầu nổi trên nước bị cuốn chảy lan rộng, làm đám cháy bùng to hơn',
      'Nước tác dụng với xăng dầu tạo thành chất khí cực độc giết chết con người',
      'Xăng dầu sẽ hấp thụ toàn bộ nước làm cho ngọn lửa tăng nhiệt độ tức thì',
      'Áp lực của vòi nước làm cho các bồn chứa kim loại tự động phát nổ ngay'
    ],
    'Vì xăng dầu nhẹ hơn nước và không tan, nếu xịt nước vào thì dầu nổi lên mặt nước tràn đi khắp nơi làm diện tích đám cháy lan rộng hơn.'
  ],
  [
    'Loại phương tiện chữa cháy nào sau đây thích hợp và hiệu quả nhất để dập tắt đám cháy chất lỏng Nhóm 4 (Đám cháy loại B)?',
    [
      'Bình chữa cháy dạng bọt (泡) hoặc dạng bột hóa học (粉末)',
      'Xô nước lã thông thường hoặc vòi phun nước áp lực cao tia thẳng',
      'Dùng quạt công nghiệp công suất lớn thổi luồng gió mạnh vào tâm lửa',
      'Đổ thêm cát ngậm đầy nước ướt lạnh lên trên bề mặt đám cháy lớn'
    ],
    'Dập lửa xăng dầu cần phương pháp làm ngạt (cắt oxy) và làm mát bằng bọt tạo màng ngăn cách (泡) hoặc bột hóa học (粉末), khí CO2.'
  ],
  [
    'So sánh giữa Xăng (ガソリン) và Dầu hỏa (灯油), nhận định nào sau đây về điểm chớp cháy và mức độ nguy hiểm là chính xác?',
    [
      'Xăng có điểm chớp cháy âm (dưới -40°C), dễ bắt lửa hơn dầu hỏa rất nhiều',
      'Dầu hỏa có điểm chớp cháy thấp hơn xăng nên dễ bắt lửa hơn ở nhiệt độ thường',
      'Cả xăng và dầu hỏa đều có điểm chớp cháy trên 100°C nên rất khó bốc cháy',
      'Dầu hỏa bay hơi mạnh và tạo hỗn hợp nổ nguy hiểm hơn xăng ở nhiệt độ phòng'
    ],
    'Xăng có điểm chớp cháy cực thấp (dưới -40°C), bay hơi mạnh ở nhiệt độ thường; trong khi dầu hỏa có điểm chớp cháy khoảng trên 40°C nên ở nhiệt độ phòng khó bắt lửa hơn xăng.'
  ],
  [
    'Tại các cây xăng tự phục vụ (セルフスタンド) ở Nhật Bản, tại sao người bơm xăng bắt buộc phải chạm tay vào miếng khử tĩnh điện trước khi cầm vòi bơm?',
    [
      'Triệt tiêu điện tích trên người, chống phóng tia lửa làm bắt cháy hơi xăng',
      'Để hệ thống máy tính của cây xăng quét vân tay nhận diện chủ xe tự động',
      'Làm mát bàn tay để vòi bơm xăng không bị quá nhiệt dẫn tới chập điện ngầm',
      'Kích hoạt máy bơm ngầm bên dưới bồn chứa bắt đầu đẩy nhiên liệu lên vòi'
    ],
    'Tĩnh điện trên quần áo người vào mùa khô hanh có thể phóng tia lửa khi chạm vào vòi bơm, bắt cháy vào hơi xăng thoát ra gây hỏa hoạn nghiêm trọng.'
  ],
  [
    'Trong kho lưu trữ hoặc phòng thao tác chứa chất lỏng dễ cháy Nhóm 4, các cửa thông gió hoặc lỗ hút khí phải được bố trí ở vị trí nào?',
    [
      'Bố trí ở vị trí thấp sát sàn nhà để hút hơi xăng dầu nặng tích tụ',
      'Bố trí ở vị trí trên đỉnh trần nhà vì hơi chất lỏng luôn bốc lên cao',
      'Phòng chứa chất lỏng dễ cháy bắt buộc phải xây kín mít không có lỗ thông',
      'Chỉ cần mở một lỗ thông gió nhỏ duy nhất ngay giữa cánh cửa ra vào'
    ],
    'Do hơi chất lỏng nhóm 4 nặng hơn không khí và chìm xuống đáy sàn, các cửa/ống hút thông gió bắt buộc phải đặt sát mặt sàn để hút khí dễ cháy ra ngoài an toàn.'
  ],
  [
    'Trong pháp luật phòng cháy chữa cháy Nhật Bản, khái niệm "Số lượng chỉ định" (指定数量) đối với chất nguy hiểm dùng để làm gì?',
    [
      'Mốc quy định: lưu trữ từ mức này trở lên bắt buộc phải xin phép và theo luật',
      'Số lượng tối đa mà một người dân bình thường được phép mua trong suốt cuộc đời',
      'Chỉ số đo mức độ ô nhiễm không khí tối đa mà một nhà xưởng được phép xả thải',
      'Số lượng thùng chứa tối đa được phép xếp chồng lên nhau trên một chuyến xe tải'
    ],
    '指定数量 (Số lượng chỉ định) là lượng làm chuẩn pháp lý: nếu lưu trữ, xử lý chất nguy hiểm từ số lượng chỉ định trở lên thì cơ sở phải được cơ quan có thẩm quyền cấp phép và tuân thủ các quy định khắt khe của Luật PCCC.'
  ]
];
