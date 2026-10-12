# features/classes/

Quản lý lớp học (tạo lớp, thêm/xóa học sinh vào lớp). Không nằm trong
danh sách chức năng gốc ở Ngày 1, nhưng phát sinh từ các quyết định đã
chốt (nhiều giáo viên, học sinh theo từng lớp — xem ARCHITECTURE.md mục
9) — là điều kiện cần trước khi gán bài học cho lớp (Ngày 14–16).

- `services/class-service.ts` — CRUD lớp + quản lý thành viên lớp.
- `actions.ts` — `createClassAction`, `addStudentToClassAction`, `removeStudentFromClassAction`. Dùng `requireTeacher()` dùng chung (`lib/auth/require-teacher.ts`).
- `components/CreateClassForm.tsx`, `AddStudentToClassForm.tsx`, `RemoveStudentButton.tsx`.

Trang: `app/teacher/classes/page.tsx` (danh sách lớp), `app/teacher/classes/[id]/page.tsx` (chi tiết 1 lớp).
