# features/vocabulary/

Quản lý từ vựng.

- `services/vocabulary-service.ts` — các hàm CRUD (list, get, create, update, delete). Không tự gọi auth, không biết gì về UI — chỉ nói chuyện với Supabase. RLS (Ngày 2) tự đảm bảo mỗi giáo viên chỉ thấy/sửa được từ vựng của mình.
- Kiểu dữ liệu dùng chung: `types/vocabulary.ts`.

- `components/VocabularyList.tsx` — hiển thị bảng từ vựng (chỉ xem), có trạng thái rỗng riêng.
- Trang `app/teacher/vocabulary/page.tsx` gọi `listVocabulary()` và hiển thị qua `VocabularyList`.

Chưa có: Server Action thêm/sửa/xóa, tìm kiếm/lọc, import hàng loạt (Ngày 9–12).
