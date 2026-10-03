import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client "admin", dùng SUPABASE_SERVICE_ROLE_KEY — bỏ qua mọi RLS.
 *
 * CHỈ được import trong code chạy trên server (Server Action, Route Handler).
 * KHÔNG BAO GIỜ import file này trong Client Component, và KHÔNG BAO GIỜ
 * đặt tên biến môi trường này với tiền tố NEXT_PUBLIC_.
 *
 * Tạo client bên trong hàm (không tạo sẵn ở ngoài) để nếu thiếu biến môi
 * trường, lỗi chỉ xảy ra lúc thật sự gọi tới, không làm sập cả lúc build.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Thiếu SUPABASE_SERVICE_ROLE_KEY. Vào Supabase Dashboard > Settings > API " +
        "lấy khóa 'service_role', thêm vào .env.local (xem DEPLOY.md).",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
