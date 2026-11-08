export const DIVORCE = {
  // NPC ngỏ ý muốn ly hôn để đến với bạn (2–4 câu, có 1 câu tiếng Nhật trong 「」)
  ask: [
    {
      title: 'Đối diện sự thật',
      text: '{name} hẹn bạn ở một góc quán vắng sau giờ làm, gương mặt lộ rõ vẻ mệt mỏi sau nhiều đêm suy nghĩ. Nhìn thẳng vào mắt bạn, {name} khẽ nói: 「もう嘘をつき続けるのは限界なんだ」. {name} muốn thẳng thắn làm thủ tục ly hôn với {spouse} để cả hai có thể đàng hoàng bên nhau, dù biết phía trước là áp lực dư luận và trách nhiệm bồi thường (慰謝料).',
    },
    {
      title: 'Quyết định ngã rẽ',
      text: 'Dưới hàng cây ven sông sau giờ tan ca, {name} ngập ngừng mở lời khi hai người dừng bước. 「あなたと出会って、これからの人生を正直に生きたいと思ったんだ」. {name} đã chuẩn bị tâm lý nói chuyện rõ ràng với {spouse}, sẵn sàng nhượng lại phần lớn tài sản tích góp và cam kết chu cấp {kid} đầy đủ để tìm lại sự bình yên.',
    },
    {
      title: 'Lời hứa tương lai',
      text: '{name} tìm gặp bạn với ánh mắt nghiêm túc, không còn sự do dự thường ngày. 「時間はかかるかもしれないけれど、覚悟はできているよ」. {name} hiểu rõ việc chia tay {spouse} tại một thị trấn nhỏ sẽ kéo theo nhiều dị nghị, nhưng vẫn muốn dứt khoát để chịu trách nhiệm với tình cảm của cả hai.',
    },
  ],

  // Kết quả khi bạn ủng hộ (1–2 câu)
  support: [
    'Nghe bạn đồng ý cùng san sẻ, {name} như trút bỏ được tảng đá đè nặng bấy lâu trong lòng. {name} khẽ mỉm cười và hứa sẽ giải quyết mọi thỏa thuận với {spouse} một cách có trách nhiệm nhất.',
    'Nhận được sự ủng hộ chân thành từ bạn, {name} nắm chặt tay bạn và gật đầu đầy tin tưởng. Cả hai biết con đường phía trước còn nhiều thử thách, nhưng sự thấu hiểu này là chỗ dựa lớn nhất.',
    '{name} xúc động rơi nước mắt vì nhận ra bản thân không phải đơn độc gánh vác quyết định này. Sự vững lòng của bạn tiếp thêm dũng khí để {name} bước vào cuộc đối thoại khó khăn với gia đình {spouse}.',
  ],

  // Khi bạn bảo hãy suy nghĩ thêm / chờ (1–2 câu)
  wait: [
    '{name} trầm ngâm hồi lâu rồi gật đầu tán thành, nhận ra bản thân cần thêm thời gian để bình tâm suy xét mọi hệ quả.',
    'Hiểu được sự lo lắng chín chắn của bạn, {name} quyết định không vội vàng nộp đơn mà sẽ cân nhắc kỹ lưỡng mọi nghĩa vụ với {spouse} và kế hoạch tương lai {kid}.',
    'Lời khuyên của bạn giúp bầu không khí chùng xuống nhưng nhẹ nhõm hơn, {name} hứa sẽ suy nghĩ thật thấu đáo trước khi đưa ra bước đi tiếp theo.',
  ],

  // Khi bạn muốn dừng mối quan hệ (1–2 câu, buồn)
  stop: [
    'Nghe bạn nói muốn dừng lại, ánh mắt {name} chùng xuống đầy cay đắng nhưng không hề trách móc. {name} khẽ cúi đầu xin lỗi vì đã làm xáo trộn cuộc sống của bạn, rồi lặng lẽ quay về đối diện với cuộc hôn nhân nguội lạnh cùng {spouse}.',
    '{name} cắn môi nén tiếng thở dài, tôn trọng ranh giới mà bạn đã vạch ra để tránh làm tổn thương thêm ai. Kể từ hôm nay, khoảng cách giữa hai người sẽ quay trở về đúng mực như những người quen bình thường.',
    'Bầu không khí rơi vào im lặng buốt giá khi {name} hiểu rằng cả hai không thể cùng nhau vượt qua định kiến xã hội. {name} lau vội khóe mắt, chúc bạn có một cuộc sống bình an rồi một mình gánh vác thực tại bế tắc.',
  ],

  // Vài ngày sau: thủ tục 離婚届 ở tòa thị chính xong, NPC chuyển sang sống công khai với tư cách người yêu bạn (2–4 câu)
  done: [
    {
      title: 'Tờ đơn tại tòa thị chính',
      text: 'Sau khi có đủ chữ ký của hai người làm chứng thành niên theo luật định, tờ 離婚届 đã chính thức được tiếp nhận tại 役所. {name} bước ra cổng tòa thị chính với một hơi thở dài nhẹ nhõm sau chuỗi ngày đàm phán căng thẳng cùng {spouse}. Từ hôm nay, {name} có thể đường hoàng sánh bước cùng bạn giữa thanh thiên bạch nhật mà không còn phải lo âu.',
    },
    {
      title: 'Trang giấy mới',
      text: 'Mọi thủ tục tách hộ tịch (戸籍) đã được xử lý xong xuôi sau khi việc ly hôn thuận tình có hiệu lực pháp lý. {spouse} đã dọn đồ ra khỏi căn hộ chung, để lại cho {name} một khoảng trời riêng. Tối nay, hai bạn cùng nhau nấu bữa ăn đầu tiên trong sự thanh thản, chính thức bắt đầu mối quan hệ công khai.',
    },
    {
      title: 'Bình yên sau giông bão',
      text: '{name} và người cũ đã hoàn tất việc phân chia tài sản cũng như cam kết bằng văn bản về nghĩa vụ chu cấp {kid}. Cầm trên tay giấy tờ xác nhận tình trạng độc thân mới, {name} tự tin đưa bạn đến siêu thị quen và chào hỏi mọi người với tư cách người yêu bạn. Những lo âu vụng trộm ngày nào giờ đã nhường chỗ cho một cuộc sống đường hoàng, gắn kết.',
    },
  ],

  // Bị vợ/chồng phát hiện, NPC quyết định bỏ đi và chọn bạn (2–4 câu, căng thẳng)
  leave: [
    {
      title: 'Cuộc đối đầu căng thẳng',
      text: 'Mối quan hệ bị {spouse} phát hiện bất ngờ sau khi xem được tin nhắn hẹn hò, kéo theo một cuộc tranh cãi nảy lửa trong gia đình. Thay vì chối bỏ hay lùi bước, {name} dứt khoát gom vài bộ quần áo rồi rời khỏi căn nhà chung ngay trong đêm. Đứng trước cửa phòng bạn với vẻ mặt bơ phờ, {name} khẳng định đã quyết định chọn bạn và sẵn sàng đối diện với thủ tục ly hôn phức tạp sắp tới.',
    },
    {
      title: 'Rời đi dứt khoát',
      text: '{spouse} tìm đến tận nơi làm việc tra hỏi khi mối nghi ngờ bùng nổ, khiến bầu không khí trở nên vô cùng căng thẳng trước mắt đồng nghiệp. Để bảo vệ bạn khỏi điều tiếng, {name} công khai tuyên bố ly thân và chấp nhận dọn ra ngoài ở trọ ngay lập tức. {name} chủ động bàn bạc phương án chu cấp {kid} từ xa và tìm đến bạn, kiên định với sự lựa chọn của trái tim.',
    },
    {
      title: 'Quyết định dũng cảm',
      text: 'Sau cuộc cãi vã không thể cứu vãn với {spouse}, {name} hiểu rằng cuộc hôn nhân bấy lâu thực sự đã đi đến hồi kết. Không muốn tiếp tục sống trong sự dằn vặt và ngột ngạt, {name} để lại chìa khóa nhà cùng lời đề nghị ly hôn rồi xách vali tìm bạn. Nhìn vào mắt bạn, {name} bình thản nói: "Dù có phải bắt đầu lại từ hai bàn tay trắng, mình cũng không hối hận vì đã chọn bạn".',
    },
  ],

  // Tin đồn khu phố sau ly hôn, 1 câu, bắt đầu bằng emoji, có {name}
  rumor: [
    '🗣️ Nghe mấy bà bên hội phụ nữ khu phố kháo nhau rằng {name} vừa nộp đơn ly hôn ở tòa thị chính tuần trước.',
    '👀 Có người nhìn thấy {name} xách vali dọn ra khỏi nhà cũ và thuê một căn hộ nhỏ gần ga tàu.',
    '🤫 Ở chỗ phân loại rác sáng nay, hàng xóm cứ xì xào mãi chuyện {name} quyết định dứt khoát chia tay người cũ sau nhiều năm chung sống.',
    '🏪 Bác bán rau đầu chợ bảo dạo này hay thấy {name} đi mua đồ ăn cùng một bạn người Việt Nam với vẻ mặt rất hạnh phúc.',
    '🏢 Nghe bảo đồng nghiệp trong xưởng đang bàn tán chuyện {name} chấp nhận phân chia phần lớn tài sản chỉ để được sống tự do.',
    '🍵 Mấy cụ cao tuổi ở quán trà thì lắc đầu bảo chuyện ly hôn của {name} ở thị trấn này chắc chắn sẽ còn bị đàm tiếu dài dài.',
  ],
};
