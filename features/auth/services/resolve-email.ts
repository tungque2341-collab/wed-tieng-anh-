/**
 * Học sinh đăng nhập bằng "tên đăng nhập" (username), không có email thật.
 * Nhưng Supabase Auth bắt buộc phải có email để đăng nhập.
 * => Hệ thống tự tạo một email nội bộ dạng "<username>@hocsinh.local".
 *
 * Giáo viên vẫn đăng nhập bằng email thật, không cần đổi gì.
 *
 * Hàm này nhận "identifier" người dùng gõ vào ô đăng nhập, và trả về
 * email thật sự sẽ gửi cho Supabase Auth.
 */

export const STUDENT_EMAIL_DOMAIN = "hocsinh.local";

export function resolveLoginEmail(identifier: string): string {
  const trimmed = identifier.trim();

  // Nếu người dùng gõ gì đó có chứa "@", coi là email thật (giáo viên)
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  // Ngược lại, coi là tên đăng nhập của học sinh
  return `${trimmed.toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
}
