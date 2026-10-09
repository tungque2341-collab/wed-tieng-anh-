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

- `components/VocabularyFilters.tsx` — form tìm kiếm + sắp xếp, dùng `method="get"` thuần (không cần Client Component, không cần JavaScript) — submit tự chuyển trang qua query string (`?q=...&sort=...`).
- `listVocabulary()` nhận thêm `{ search?, sortBy? }`. Khi có tìm kiếm: chạy 2 truy vấn riêng (theo "word", theo "meaning") rồi gộp + loại trùng ở ứng dụng, tránh phải tự ráp chuỗi `.or(...)` dễ vỡ cú pháp khi gõ dấu phẩy/ngoặc.

- `parse-bulk-import.ts` — hàm thuần phân tích văn bản nhập nhiều từ (mỗi dòng 1 từ, ngăn cách bởi `|`). Không đụng Supabase/DOM nên test được bằng Node thường, không cần mạng.
- `createVocabularyBulk()` — thêm nhiều dòng cùng lúc bằng 1 câu `insert` (mảng), không chèn từng từ một.
- `actions.ts` có thêm `importVocabularyAction`: nếu có dòng sai định dạng thì báo rõ dòng nào, **không thêm từ nào cả** (tất cả hoặc không gì, tránh import dở dang gây khó hiểu).
- `components/ImportVocabularyForm.tsx` — ẩn mặc định (nút "Nhập nhiều từ cùng lúc" để mở ra), vì đây là tính năng phụ.

Vậy là đã xong toàn bộ Giai đoạn 3 — Từ vựng (Ngày 7–12).
