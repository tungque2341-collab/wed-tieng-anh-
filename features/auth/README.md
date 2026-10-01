# features/auth/

Đăng nhập, đăng xuất, quản lý session.

- `services/resolve-email.ts` — đổi "tên đăng nhập" (học sinh) hoặc email (giáo viên) thành email thật gửi cho Supabase Auth.
- `actions.ts` — Server Action `signIn`, `signOut`.
- `components/LoginForm.tsx` — form đăng nhập (Client Component, dùng `useActionState` để hiện trạng thái đang xử lý/lỗi).
- `components/UserStatus.tsx` — hiển thị "Xin chào, <tên>" + nút đăng xuất nếu đã đăng nhập, hoặc link "Đăng nhập" nếu chưa.

Chưa có: chặn truy cập theo route (middleware) — sẽ làm ở Ngày 6.
