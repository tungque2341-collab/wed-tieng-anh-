# features/lessons/

Quản lý bài học.

- `services/lesson-service.ts` — `listLessons`, `getLessonById`, `createLesson`.
- `actions.ts` — `createLessonAction`, dùng `requireTeacher()` dùng chung (`lib/auth/require-teacher.ts`).
- `components/CreateLessonForm.tsx`, `LessonList.tsx`.

Trang: `app/teacher/lessons/page.tsx`.

Chưa có: sửa/xóa bài học, thêm từ vựng vào bài học (Ngày 15), trang học bài (Ngày 16), gán bài học cho lớp.
