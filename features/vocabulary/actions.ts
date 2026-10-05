"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createVocabulary } from "./services/vocabulary-service";

export type CreateVocabularyState = {
  error: string | null;
  success: boolean;
};

export async function createVocabularyAction(
  _prevState: CreateVocabularyState,
  formData: FormData,
): Promise<CreateVocabularyState> {
  const supabase = await createClient();

  // Tự kiểm tra lại người gọi là giáo viên đã đăng nhập (không chỉ dựa
  // vào việc form này chỉ hiện trên trang /teacher/* — Server Action có
  // thể bị gọi trực tiếp, không qua giao diện).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập.", success: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "teacher") {
    return { error: "Chỉ giáo viên mới được thêm từ vựng.", success: false };
  }

  const { error } = await createVocabulary(supabase, user.id, {
    word: String(formData.get("word") ?? ""),
    meaning: String(formData.get("meaning") ?? ""),
    phonetic: String(formData.get("phonetic") ?? ""),
    example: String(formData.get("example") ?? ""),
  });

  if (error) {
    return { error, success: false };
  }

  // Làm mới danh sách từ vựng hiển thị trên trang (không cần tải lại cả trang)
  revalidatePath("/teacher/vocabulary");
  return { error: null, success: true };
}
