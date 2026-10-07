# features/vocabulary/

Quản lý từ vựng.

- `services/vocabulary-service.ts` — các hàm CRUD (list, get, create, update, delete). Không tự gọi auth, không biết gì về UI — chỉ nói chuyện với Supabase. RLS (Ngày 2) tự đảm bảo mỗi giáo viên chỉ thấy/sửa được từ vựng của mình.
- Kiểu dữ liệu dùng chung: `types/vocabulary.ts`.

- `components/VocabularyList.tsx` — hiển thị bảng từ vựng (chỉ xem), có trạng thái rỗng riêng.
- `actions.ts` — Server Action `createVocabularyAction`. Tự kiểm tra lại vai trò giáo viên phía server (không chỉ dựa vào việc form chỉ hiện trên trang `/teacher/*`), gọi `revalidatePath` để danh sách tự cập nhật sau khi thêm.
- `components/AddVocabularyForm.tsx` — form thêm từ vựng, dùng `useActionState`, tự xóa trắng form sau khi thêm thành công.
- Trang `app/teacher/vocabulary/page.tsx` gọi `listVocabulary()` và hiển thị qua `VocabularyList`, có `AddVocabularyForm` ở trên.

- `components/VocabularyRow.tsx` — mỗi dòng tự quản lý trạng thái sửa (bật/tắt chế độ sửa inline) và xóa (có `confirm()` trước khi xóa). Dùng `useActionState` riêng cho sửa và xóa.
- `actions.ts` có thêm `updateVocabularyAction`, `deleteVocabularyAction` — dùng chung hàm `requireTeacher()` để tránh lặp code kiểm tra quyền.

Chưa có: tìm kiếm/lọc, import hàng loạt (Ngày 11–12).
