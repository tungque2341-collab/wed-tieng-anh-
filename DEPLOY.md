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

## Bước 4 — Thêm biến môi trường Supabase vào Vercel (Ngày 4)

Project Supabase đã được tạo (tên `hoc-tienganh-co-trinh`, vùng Singapore) và đã kết nối vào code. File `.env.local` trong gói bạn tải về đã có sẵn URL và khóa `anon` thật — khi bạn chạy `npm run dev` ở máy mình, Next.js tự đọc file này, không cần làm gì thêm.

Nhưng bản deploy trên Vercel **không dùng `.env.local`** (file này không được đẩy lên GitHub). Cần khai báo lại trên Vercel:

1. Vào https://vercel.com → chọn project `hoc-tienganh-co-trinh` → **Settings** → **Environment Variables**
2. Thêm lần lượt:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fizcgthzdvfjwnfvshqq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Ralyji9OSriAaZhnVI1Qtg_dnvahJcM` |

3. Bấm **Save**, sau đó vào tab **Deployments** → bấm **Redeploy** ở bản mới nhất (biến môi trường chỉ áp dụng cho lần deploy sau khi lưu).

> Chưa cần thêm `SUPABASE_SERVICE_ROLE_KEY` ở đây — khóa đó chỉ dùng ở Ngày 6, lúc đó sẽ hướng dẫn thêm.

---

## Bước 5 — Tạo tài khoản giáo viên đầu tiên (Ngày 5)

Trang `/login` đã có, nhưng chưa có tài khoản nào để đăng nhập thử. Vì lý do bảo mật, Claude không tự tạo tài khoản bằng mật khẩu thật của bạn — bạn tự tạo theo các bước sau:

1. Vào https://supabase.com/dashboard/project/fizcgthzdvfjwnfvshqq/auth/users
2. Bấm **Add user** → **Create new user**
3. Điền:
   - **Email:** email thật của bạn (ví dụ email của cô Trinh)
   - **Password:** mật khẩu bạn tự chọn (không cần gửi cho ai, kể cả Claude)
   - Tích **Auto Confirm User** (để khỏi cần xác nhận qua email)
4. Bấm **Create user**

> Lưu ý: cách tạo này **chưa đánh dấu đúng vai trò "giáo viên"** trong hệ thống (mặc định sẽ là "học sinh"). Nhắn cho Claude biết email bạn vừa tạo, Claude sẽ sửa lại đúng vai trò "giáo viên" trong database giúp bạn (không cần biết mật khẩu).

Sau khi có tài khoản, thử đăng nhập:
- Chạy `npm run dev`, mở http://localhost:3000/login
- Đăng nhập bằng **email** + mật khẩu vừa tạo
- Đăng nhập xong sẽ về trang chủ, thấy dòng "Xin chào, ... (Giáo viên)" và nút "Đăng xuất"

## Việc cần làm ở các ngày sau (không làm ở đây)

- **Ngày 6:** lấy `SUPABASE_SERVICE_ROLE_KEY` từ Supabase Dashboard → Settings → API, thêm vào `.env.local` (máy bạn) và vào Vercel (giống bước 4 ở trên, thêm 1 dòng nữa).
