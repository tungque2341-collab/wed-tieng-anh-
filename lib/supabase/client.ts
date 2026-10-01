import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client dùng trong trình duyệt (Client Component).
 * Chỉ dùng khóa "anon" (công khai) — không bao giờ đặt service_role key ở đây.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
