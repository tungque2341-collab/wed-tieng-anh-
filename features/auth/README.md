# features/auth/

Đăng nhập, đăng xuất, quản lý session, giáo viên tạo tài khoản học sinh.

- `services/resolve-email.ts` — đổi "tên đăng nhập" (học sinh) hoặc email (giáo viên) thành email thật gửi cho Supabase Auth.
- `actions.ts`:
  - `signIn` — đăng nhập, tự chuyển đến `/teacher` hoặc `/student` theo vai trò.
  - `signOut` — đăng xuất.
  - `createStudentAccount` — giáo viên tạo tài khoản học sinh (kiểm tra lại vai trò "teacher" phía server trước khi cho tạo, không chỉ dựa vào giao diện).
- `components/LoginForm.tsx` — form đăng nhập.
- `components/UserStatus.tsx` — hiển thị trạng thái đăng nhập + nút đăng xuất.
- `components/CreateStudentForm.tsx` — form tạo tài khoản học sinh (chỉ hiện trong `/teacher/students`, nhưng bản thân Server Action vẫn tự kiểm tra quyền).

Middleware (`middleware.ts` ở thư mục gốc) chặn `/student/*` và `/teacher/*` theo đăng nhập + đúng vai trò — xem Ngày 6 trong ARCHITECTURE.md.
