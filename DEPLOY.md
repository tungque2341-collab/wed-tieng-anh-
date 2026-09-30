# DEPLOY.md — Đưa dự án lên GitHub và Vercel

Đây là việc cần tài khoản của bạn, nên tôi không tự làm thay được. Làm theo đúng thứ tự dưới đây, chạy trên **máy của bạn** (không phải trên máy tôi), trong thư mục dự án bạn vừa tải về và giải nén.

---

## Bước 0 — Chuẩn bị máy của bạn

Kiểm tra đã có Node.js chưa (mở Terminal / Command Prompt, gõ):

```bash
node -v
```

Nếu chưa có, tải và cài tại https://nodejs.org (chọn bản LTS).

Sau khi giải nén dự án, mở Terminal **ngay trong thư mục dự án** (thư mục có file `package.json`), chạy:

```bash
npm install
```

Chờ cài xong, thử chạy thử:

```bash
npm run dev
```

Mở trình duyệt vào http://localhost:3000 — nếu thấy dòng chữ "Học Tiếng Anh Cùng Cô Giáo Trinh" là đã chạy đúng. Bấm `Ctrl + C` trong Terminal để tắt.

---

## Bước 1 — Tạo repository trên GitHub

1. Đăng nhập https://github.com
2. Bấm nút **New repository** (hoặc vào https://github.com/new)
3. Đặt tên, ví dụ: `hoc-tienganh-co-trinh`
4. Chọn **Private** (khuyến nghị, vì đây là dự án riêng của bạn)
5. **Không** tích "Add a README file" (vì dự án đã có sẵn README)
6. Bấm **Create repository**

Sau khi tạo xong, GitHub sẽ hiện một trang có đoạn lệnh — giữ trang đó lại, bạn sẽ cần đường dẫn dạng:

```text
https://github.com/<tên-tài-khoản>/hoc-tienganh-co-trinh.git
```

---

## Bước 2 — Đẩy code lên GitHub

Trong Terminal, vẫn đang ở thư mục dự án (repo Git đã được khởi tạo sẵn và đã có 1 commit), chạy:

```bash
git remote add origin https://github.com/<tên-tài-khoản>/hoc-tienganh-co-trinh.git
git branch -M main
git push -u origin main
```

Thay `<tên-tài-khoản>` bằng tên tài khoản GitHub thật của bạn. Lệnh `git push` có thể hỏi bạn đăng nhập GitHub — làm theo hướng dẫn trên màn hình.

Kiểm tra: vào lại trang GitHub, refresh — phải thấy đầy đủ file (`app/`, `features/`, `supabase/`...).

---

## Bước 3 — Deploy lên Vercel

1. Đăng nhập https://vercel.com bằng tài khoản GitHub
2. Bấm **Add New...** → **Project**
3. Chọn repository `hoc-tienganh-co-trinh` vừa tạo → bấm **Import**
4. Vercel tự nhận ra đây là dự án Next.js, không cần đổi gì ở bước này
5. Bấm **Deploy**

Chờ khoảng 1–2 phút, Vercel sẽ cho một đường link dạng `https://hoc-tienganh-co-trinh-xxxx.vercel.app`. Mở link đó — phải thấy đúng trang chủ.

> Lưu ý: hôm nay (Ngày 3) trang web CHƯA kết nối Supabase, nên đây chỉ là trang chủ tĩnh. Việc thêm biến môi trường Supabase vào Vercel sẽ làm ở Ngày 4.

Từ giờ, mỗi khi bạn (hoặc tôi thay bạn, qua các file tôi gửi) chạy `git push`, Vercel sẽ **tự động deploy lại** — không cần lặp lại bước 3.

---

## Việc cần làm ở các ngày sau (không làm ở đây)

- **Ngày 4:** tạo project Supabase, lấy khóa API, thêm vào `.env.local` (máy bạn) và vào Vercel → Project → Settings → Environment Variables (để bản deploy live cũng chạy được).
- Không tự thêm biến môi trường Supabase vào Vercel trước Ngày 4, vì chưa có project Supabase để lấy khóa.
