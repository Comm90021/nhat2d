# Nhật Ký TTS 2D 🗾

Game mô phỏng 2D chạy trên trình duyệt: cuộc sống của một thực tập sinh (TTS) người Việt ở thị trấn Hikari, Nhật Bản — **không giới hạn thời gian**, ở bao lâu là tùy bạn.

- **Ca làm việc** là câu hỏi tình huống theo nghề (an toàn, quy trình, 報連相…). Mini-game (🍙 cơm nắm, 🍓 dâu tây, 🏗️ giàn giáo) bật được trong menu.
- **Tiếng Nhật N5 → N1** theo năng lực thật: trả lời đúng liên tục được nhân điểm, câu sai được hỏi lại. Muốn có **chứng chỉ JLPT** phải đăng ký và đi thi (tháng 7, tháng 12).
- **Lộ trình visa**: TTS số 1 → thi tay nghề 基礎級 → TTS số 2 → TTS số 3 / Kỹ năng đặc định số 1 → số 2 → thường trú. Hết hạn mà không đủ điều kiện là phải về nước.
- **Quan hệ**: 10 nhân vật (đồng nghiệp, hàng xóm, cộng đồng Việt, giao lưu quốc tế, CLB bóng đá) với mức thân thiết và quyền lợi riêng; cả những cám dỗ như vay nóng, đa cấp, môi giới làm chui.
- **Tình cảm & gia đình**: hẹn hò, cầu hôn, ra mắt gia đình, kết hôn, sinh con (visa quyết định con được ở Nhật hay phải về quê), áp lực gia đình, về thăm nhà dịp Tết.
- **Thế giới sống (v3.1)**:
  - Hơn 55 NPC, hành vi sinh từ **quy luật** chứ không viết sẵn. Mỗi người có tính cách (hướng ngoại, dễ chịu, tận tâm, bất ổn cảm xúc…), tâm trạng thay đổi từng ngày, ca làm, thói quen, và tự chọn việc làm theo giờ, thời tiết, tâm trạng.
  - NPC tự rủ đi chơi, hỏi vay tiền, cãi nhau, tỏ ý thích. Giữa các NPC cũng có quan hệ, sinh ra tin đồn.
- **Nội thất đi lại được**: ký túc xá, konbini, siêu thị, phòng khám, lớp học, quán ramen, viện dưỡng lão, 9 chỗ làm… Bấm vào giường, bếp, tủ đồ, bồn rửa tay, dây chuyền, bàn quản lý để tương tác.
- **Hai khu vực**: thị trấn Hikari và khu công nghiệp Minato, đi lại bằng tàu.
- **Lịch 12 tháng = 84 ngày** (mỗi tuần một tháng), lương tháng có phiếu lương chi tiết, sổ thu chi.
- Trả nợ 150 triệu đồng, ăn uống, ốm đau, bốn mùa, ngày đêm, sự kiện: hanami, lễ hội mùa hè, động đất, bão…
- Chơi được trên máy tính (WASD / mũi tên + E) và điện thoại (cần điều khiển cảm ứng)

Toàn bộ hình ảnh được vẽ bằng code (pixel art), âm thanh tạo bằng WebAudio. Không cần file ảnh hay nhạc, không có bước build.

## Chạy thử trên máy

Trình duyệt không cho tải ES module qua `file://`, nên cần một web server tĩnh:

```bash
npx serve .
# hoặc
python -m http.server 8000
```

Sau đó mở địa chỉ hiển thị trong terminal (ví dụ http://localhost:3000).

## Đăng lên GitHub Pages

1. Tạo repo mới trên GitHub, ví dụ `nhat2d`.
2. Đẩy code lên:
   ```bash
   git remote add origin https://github.com/<tên-tài-khoản>/nhat2d.git
   git push -u origin main
   ```
3. Vào **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)`.
4. Khoảng 1 phút sau, game sẽ có tại `https://<tên-tài-khoản>.github.io/nhat2d/`.

Muốn địa chỉ gọn kiểu `https://<tên-tài-khoản>.github.io/` thì đặt tên repo đúng là `<tên-tài-khoản>.github.io`.

## Cấu trúc

```
index.html          giao diện HTML (HUD, hộp thoại, màn hình chính)
css/style.css       giao diện
js/main.js          khởi động, màn hình chính, vòng lặp khung hình
js/state.js         trạng thái game, lịch, lưu/tải (localStorage)
js/data.js          nghề, câu tiếng Nhật, lời khuyên
js/town.js          bản đồ thị trấn, di chuyển, ngày/đêm, thời tiết
js/places.js        các địa điểm và NPC
js/work.js          ca làm việc
js/events.js        sự kiện theo ngày và ngẫu nhiên
js/days.js          ngủ, sang ngày mới, lĩnh lương, kết thúc
js/mini/*.js        3 mini-game
js/pixel.js         hàm vẽ pixel art
js/ui.js, input.js, audio.js, engine.js
```

Thêm `?debug` vào cuối địa chỉ để mở biến `window.__G` (trạng thái game) khi cần gỡ lỗi.
