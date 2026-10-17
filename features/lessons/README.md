# features/lessons/

Quản lý bài học.

- `services/lesson-service.ts` — `listLessons`, `getLessonById`, `createLesson`, `listVocabularyInLesson`, `addVocabularyToLesson`, `removeVocabularyFromLesson`.
- `actions.ts` — `createLessonAction`, `addVocabularyToLessonAction`, `removeVocabularyFromLessonAction`. Dùng `requireTeacher()` dùng chung (`lib/auth/require-teacher.ts`).
- `components/CreateLessonForm.tsx`, `LessonList.tsx`, `AddVocabularyToLessonForm.tsx`, `RemoveVocabularyFromLessonButton.tsx`.

Trang: `app/teacher/lessons/page.tsx` (danh sách + tạo mới), `app/teacher/lessons/[id]/page.tsx` (chi tiết: thêm/xóa từ vựng — dropdown chỉ hiện từ CHƯA có trong bài học này, xóa chỉ bỏ liên kết, không xóa từ vựng gốc).

Chưa có: sửa/xóa bài học, trang học bài (Ngày 16), gán bài học cho lớp.
