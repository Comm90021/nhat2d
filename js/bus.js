// Bus sự kiện: các hệ thống đăng ký xử lý theo thứ tự ưu tiên (số nhỏ chạy trước).
// Sự kiện chính: 'day:end', 'day:start', 'month:end', 'morning' (tương tác), 'shift:done'.
const handlers = {};

export const bus = {
  on(ev, prio, fn, name = '') {
    (handlers[ev] = handlers[ev] || []).push({ prio, fn, name });
    handlers[ev].sort((a, b) => a.prio - b.prio);
  },
  // Chạy lần lượt; nếu một handler trả về 'stop' thì dừng chuỗi và trả về 'stop'; 'end' = kết thúc game
  async emit(ev, ...args) {
    for (const h of handlers[ev] || []) {
      const r = await h.fn(...args);
      if (r === 'stop' || r === 'end') return r;
    }
    return null;
  },
  list(ev) { return (handlers[ev] || []).map((h) => `${h.prio}:${h.name}`); },
};
