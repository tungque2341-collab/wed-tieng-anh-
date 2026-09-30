# Học Tiếng Anh Cùng Cô Giáo Trinh

Website học tiếng Anh cho học sinh và giáo viên.

## Công nghệ

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage) · Vercel

## Chạy dự án ở máy của bạn

```bash
npm install
npm run dev
```

Mở http://localhost:3000 để xem.

## Cấu trúc thư mục

Xem chi tiết trong `ARCHITECTURE.md` (ở thư mục gốc dự án, ngoài repo này) hoặc đọc file `README.md` trong từng thư mục con:

- `app/` — trang & route (Next.js App Router)
- `components/` — component dùng chung
- `features/` — mỗi tính năng một thư mục riêng
- `services/` — truy vấn dữ liệu dùng chung
- `lib/` — tiện ích, Supabase client
- `hooks/` — React hooks dùng chung
- `types/` — kiểu TypeScript dùng chung
- `supabase/` — file SQL (schema, RLS policies)

## Biến môi trường

Sao chép `.env.local.example` thành `.env.local` rồi điền giá trị thật (xem hướng dẫn trong `DEPLOY.md`). Không commit `.env.local` lên GitHub.

## Trạng thái dự án

Xem `TODO.md` và `PROJECT_PLAN.md` để biết tiến độ 30 ngày.
