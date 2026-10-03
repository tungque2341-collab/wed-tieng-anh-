"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveLoginEmail, STUDENT_EMAIL_DOMAIN } from "./services/resolve-email";

export type SignInState = {
  error: string | null;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!identifier.trim() || !password) {
    return { error: "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu." };
  }

  const email = resolveLoginEmail(identifier);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // Không nói rõ "sai username" hay "sai mật khẩu" để tránh lộ
    // thông tin tài khoản nào tồn tại trong hệ thống.
    return { error: "Tên đăng nhập/email hoặc mật khẩu không đúng." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.role === "teacher" ? "/teacher" : "/student");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type CreateStudentState = {
  error: string | null;
  success: string | null;
};

const initialCreateStudentState: CreateStudentState = {
  error: null,
  success: null,
};

export async function createStudentAccount(
  _prevState: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !username || !password) {
    return {
      ...initialCreateStudentState,
      error: "Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu.",
    };
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      ...initialCreateStudentState,
      error:
        "Tên đăng nhập chỉ gồm chữ thường, số, dấu gạch dưới (_), từ 3-20 ký tự.",
    };
  }

  if (password.length < 6) {
    return {
      ...initialCreateStudentState,
      error: "Mật khẩu cần ít nhất 6 ký tự.",
    };
  }

  // Xác thực người gọi THẬT SỰ là giáo viên đã đăng nhập.
  // Không chỉ dựa vào việc giao diện có ẩn/hiện form hay không,
  // vì Server Action có thể bị gọi trực tiếp.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ...initialCreateStudentState, error: "Bạn cần đăng nhập." };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "teacher") {
    return {
      ...initialCreateStudentState,
      error: "Chỉ giáo viên mới tạo được tài khoản học sinh.",
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      ...initialCreateStudentState,
      error:
        e instanceof Error
          ? e.message
          : "Chưa cấu hình được tài khoản quản trị.",
    };
  }

  const email = `${username}@${STUDENT_EMAIL_DOMAIN}`;

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "student",
      username,
      full_name: fullName,
    },
  });

  if (createError) {
    if (
      createError.message.toLowerCase().includes("already been registered") ||
      createError.code === "email_exists"
    ) {
      return {
        ...initialCreateStudentState,
        error: "Tên đăng nhập đã được dùng, hãy chọn tên khác.",
      };
    }
    return {
      ...initialCreateStudentState,
      error: `Không tạo được tài khoản: ${createError.message}`,
    };
  }

  return {
    error: null,
    success: `Đã tạo tài khoản học sinh "${username}" thành công.`,
  };
}
