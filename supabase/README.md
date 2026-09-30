# supabase/ — Database & bảo mật (Ngày 2)

Thư mục này chứa toàn bộ thiết kế database. Chưa kết nối Supabase thật (việc đó là Ngày 4), nhưng file đã được **kiểm tra bằng cách chạy thật** trên một PostgreSQL cục bộ, giả lập môi trường giống Supabase.

## Thứ tự chạy khi có project Supabase (Ngày 4 trở đi)

1. Mở Supabase Dashboard → **SQL Editor**
2. Dán và chạy `schema.sql` trước
3. Dán và chạy `policies.sql` sau

Không đổi thứ tự, vì `policies.sql` cần các bảng trong `schema.sql` đã tồn tại.

## `schema.sql` chứa gì

12 bảng: `profiles`, `classes`, `class_students`, `vocabulary`, `lessons`, `lesson_vocabulary`, `lesson_classes`, `learning_progress`, `quizzes`, `quiz_questions`, `quiz_answers`, `quiz_results`.

Mỗi bảng có: khóa chính (uuid), khóa ngoại, `created_at`/`updated_at` (tự cập nhật bằng trigger), index cho các cột hay truy vấn.

Có 1 trigger đặc biệt: khi một tài khoản mới được tạo trong `auth.users` (giáo viên tự đăng ký, hoặc giáo viên tạo tài khoản học sinh qua Admin API), một dòng `profiles` tương ứng được **tự động tạo**, đọc `role`, `username`, `full_name` từ `raw_user_meta_data`.

## `policies.sql` chứa gì

Bật Row Level Security (RLS) trên toàn bộ 12 bảng và định nghĩa ai được xem/thêm/sửa/xóa dòng nào.

### Vì sao có nhiều hàm `SECURITY DEFINER` ở đầu file?

Khi thử chạy thật, tôi gặp lỗi **"infinite recursion detected in policy"**: policy của bảng `lessons` kiểm tra bảng `lesson_classes`, còn policy của `lesson_classes` lại kiểm tra ngược lại bảng `lessons` → hai bên gọi nhau vô hạn.

Cách sửa: đưa các phép kiểm tra "học sinh này có ở lớp kia không", "bài học này có phải của giáo viên này không"... vào các **hàm** (ví dụ `is_my_lesson()`, `can_see_lesson()`). Các hàm này được đánh dấu `SECURITY DEFINER`, nghĩa là khi hàm tự nó truy vấn bảng, nó không bị chính sách RLS chặn lại — nên không còn vòng lặp.

Sau khi sửa, tôi test lại 9 tình huống thật (đóng vai từng người dùng), toàn bộ đều đúng như thiết kế — xem chi tiết trong báo cáo Ngày 2.

### Quy tắc quan trọng nhất: `quiz_answers`

Bảng này chứa đáp án đúng (`is_correct`). **Học sinh không có quyền SELECT bảng này** — chỉ giáo viên (chủ quiz) mới xem được. Việc học sinh làm quiz và chấm điểm sẽ đi qua Server Action ở Ngày 22–24 (code chạy trên máy chủ, không lộ đáp án ra trình duyệt), chứ không truy vấn bảng này trực tiếp từ client.

## Cách tôi đã kiểm tra (không chỉ đọc bằng mắt)

1. Cài PostgreSQL cục bộ trong môi trường làm việc.
2. Giả lập tối thiểu Supabase: tạo schema `auth`, bảng `auth.users`, hàm `auth.uid()`, role `authenticated`.
3. Chạy `schema.sql` rồi `policies.sql` — không lỗi cú pháp.
4. Tạo dữ liệu giả: 2 giáo viên (Cô Trinh, Thầy Nam), 2 học sinh (An thuộc lớp Cô Trinh, Bình không thuộc lớp nào).
5. Đóng vai từng người dùng (`SET request.jwt.claim.sub = ...`) và kiểm tra 9 tình huống, ví dụ:
   - Học sinh An chỉ thấy từ vựng/bài học của lớp mình.
   - Học sinh Bình không thấy gì (không thuộc lớp nào).
   - Học sinh Bình không tự tạo được lớp học (giả làm giáo viên) — bị từ chối.
   - Thầy Nam không xem được tiến độ học của học sinh An (không phải học sinh của thầy).
   - Học sinh An không xem được đáp án đúng của quiz.

Tất cả 9/9 đúng như thiết kế.

## Giới hạn đã biết (ghi vào `TODO.md`, sẽ xử lý ở ngày liên quan)

- Chưa có cách học sinh làm quiz an toàn qua client — xử lý ở Ngày 22–24.
- Chưa có chức năng giáo viên đặt lại mật khẩu học sinh — xử lý ở Ngày 6.
- Chưa test với Supabase Auth thật (mới test bằng bảng giả lập) — sẽ kiểm tra lại ở Ngày 4–5 khi kết nối Supabase thật.
