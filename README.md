# Nhật Ký TTS 2D 🗾

Game mô phỏng 2D chạy trên trình duyệt: một năm làm thực tập sinh (TTS) ở thị trấn Hikari, Nhật Bản.

- 3 nghề, mỗi nghề có một mini-game riêng: 🍙 kiểm tra cơm nắm, 🍓 hái dâu tây, 🏗️ dựng giàn giáo
- Đi làm trước 08:00, lĩnh lương Chủ Nhật, chuyển tiền về trả nợ 40 triệu đồng
- Ăn uống, ngủ nghỉ, ốm đau; học tiếng Nhật ở lớp tối hoặc với bà Sato hàng xóm
- Bốn mùa (hoa anh đào, mùa mưa, lá đỏ, tuyết), ngày và đêm, sự kiện: hanami, lễ hội mùa hè, động đất, bão, thi JLPT…
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
