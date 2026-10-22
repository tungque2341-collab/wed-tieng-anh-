# features/lessons/

Quản lý bài học.

- `services/lesson-service.ts` — `listLessons` (RLS tự lọc theo vai trò: giáo viên thấy bài mình tạo, học sinh thấy bài đã gán cho lớp mình — cùng 1 hàm dùng được cho cả 2 trang), `getLessonById`, `createLesson`, `listVocabularyInLesson`, `addVocabularyToLesson`, `removeVocabularyFromLesson`, `listClassesForLesson`, `assignLessonToClass`, `unassignLessonFromClass`.
- `actions.ts` — `createLessonAction`, `addVocabularyToLessonAction`, `removeVocabularyFromLessonAction`, `assignLessonToClassAction`, `unassignLessonFromClassAction`. Dùng `requireTeacher()` dùng chung (`lib/auth/require-teacher.ts`).
- `components/CreateLessonForm.tsx`, `LessonList.tsx`, `AddVocabularyToLessonForm.tsx`, `RemoveVocabularyFromLessonButton.tsx`, `AssignLessonToClassForm.tsx`, `UnassignClassButton.tsx`.

Trang giáo viên: `app/teacher/lessons/page.tsx` (danh sách + tạo mới), `app/teacher/lessons/[id]/page.tsx` (chi tiết: gán cho lớp, thêm/xóa từ vựng).
Trang học sinh (Ngày 16): `app/student/lessons/page.tsx` (danh sách bài học được gán — chỉ xem), `app/student/lessons/[id]/page.tsx` (xem từ vựng trong bài — chỉ xem, không sửa).

Chưa có: sửa/xóa bài học.
