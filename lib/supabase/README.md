# lib/supabase/

- `client.ts` — Supabase client dùng trong trình duyệt (Client Component). Dùng khóa "anon" (công khai).
- `server.ts` — Supabase client dùng trên server (Server Component, Server Action, Route Handler). Tự đọc/ghi cookie để giữ đăng nhập.

Chưa có `admin.ts` (client dùng `service_role key`, chỉ chạy trên server, dùng khi giáo viên tạo tài khoản học sinh) — sẽ thêm ở Ngày 6, khi thật sự cần.

## Cách dùng

Trong Client Component:
```ts
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

Trong Server Component / Server Action:
```ts
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```
