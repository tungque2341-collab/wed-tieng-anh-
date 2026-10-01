"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveLoginEmail } from "./services/resolve-email";

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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Không nói rõ "sai username" hay "sai mật khẩu" để tránh lộ
    // thông tin tài khoản nào tồn tại trong hệ thống.
    return { error: "Tên đăng nhập/email hoặc mật khẩu không đúng." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
