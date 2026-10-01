import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client dùng trên server (Server Component, Server Action, Route Handler).
 * Đọc/ghi cookie để giữ session đăng nhập.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll được gọi từ Server Component (không có quyền ghi cookie).
            // Bỏ qua vì middleware (Ngày 6) sẽ làm mới session giúp.
          }
        },
      },
    },
  );
}
