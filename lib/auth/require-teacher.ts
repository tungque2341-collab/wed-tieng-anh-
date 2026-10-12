import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Dùng chung cho mọi Server Action cần giới hạn "chỉ giáo viên đã đăng
 * nhập mới được gọi". Không chỉ dựa vào việc giao diện có ẩn/hiện form
 * hay không, vì Server Action có thể bị gọi trực tiếp, không qua UI.
 *
 * Trả về { teacherId } nếu hợp lệ, hoặc { error } nếu không.
 */
export async function requireTeacher(
  supabase: SupabaseClient,
): Promise<{ teacherId: string } | { error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "teacher") {
    return { error: "Chỉ giáo viên mới được thực hiện thao tác này." };
  }

  return { teacherId: user.id };
}
