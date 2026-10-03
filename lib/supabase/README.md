# lib/supabase/

- `client.ts` — Supabase client dùng trong trình duyệt (Client Component). Dùng khóa "anon" (công khai).
- `server.ts` — Supabase client dùng trên server (Server Component, Server Action, Route Handler). Tự đọc/ghi cookie để giữ đăng nhập.
- `admin.ts` — Supabase client dùng `service_role key` (bỏ qua RLS). CHỈ dùng trong Server Action/Route Handler, KHÔNG BAO GIỜ import trong Client Component. Dùng khi giáo viên tạo tài khoản học sinh.

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

Trong Server Action cần quyền admin (ví dụ tạo tài khoản học sinh):
```ts
import { createAdminClient } from "@/lib/supabase/admin";
const admin = createAdminClient(); // ném lỗi rõ ràng nếu thiếu SUPABASE_SERVICE_ROLE_KEY
```
