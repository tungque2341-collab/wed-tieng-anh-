# features/vocabulary/

Quản lý từ vựng.

- `services/vocabulary-service.ts` — các hàm CRUD (list, get, create, update, delete). Không tự gọi auth, không biết gì về UI — chỉ nói chuyện với Supabase. RLS (Ngày 2) tự đảm bảo mỗi giáo viên chỉ thấy/sửa được từ vựng của mình.
- Kiểu dữ liệu dùng chung: `types/vocabulary.ts`.

Chưa có: component UI, Server Action gọi service (sẽ xây dần Ngày 8–12: hiển thị danh sách, thêm, sửa/xóa, tìm kiếm/lọc, import hàng loạt).
