"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseBulkVocabularyInput } from "./parse-bulk-import";
import {
  createVocabulary,
  createVocabularyBulk,
  deleteVocabulary,
  updateVocabulary,
} from "./services/vocabulary-service";

/** Dùng chung cho mọi Server Action trong file này: xác nhận người gọi
 * đã đăng nhập và có vai trò "teacher". Trả về user.id nếu hợp lệ,
 * hoặc một chuỗi lỗi nếu không. */
async function requireTeacher(
  supabase: Awaited<ReturnType<typeof createClient>>,
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
  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error, success: false };

  const { error } = await createVocabulary(supabase, check.teacherId, {
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

export type UpdateVocabularyState = {
  error: string | null;
  success: boolean;
};

export async function updateVocabularyAction(
  _prevState: UpdateVocabularyState,
  formData: FormData,
): Promise<UpdateVocabularyState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error, success: false };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Thiếu id từ vựng.", success: false };

  // RLS (Ngày 2) đảm bảo chỉ sửa được từ vựng do chính giáo viên này tạo,
  // dù id có bị sửa trên trình duyệt thì cũng không sửa được từ của người khác.
  const { error } = await updateVocabulary(supabase, id, {
    word: String(formData.get("word") ?? ""),
    meaning: String(formData.get("meaning") ?? ""),
    phonetic: String(formData.get("phonetic") ?? ""),
    example: String(formData.get("example") ?? ""),
  });

  if (error) return { error, success: false };

  revalidatePath("/teacher/vocabulary");
  return { error: null, success: true };
}

export type DeleteVocabularyState = {
  error: string | null;
};

export async function deleteVocabularyAction(
  _prevState: DeleteVocabularyState,
  formData: FormData,
): Promise<DeleteVocabularyState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) return { error: check.error };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Thiếu id từ vựng." };

  const { error } = await deleteVocabulary(supabase, id);
  if (error) return { error };

  revalidatePath("/teacher/vocabulary");
  return { error: null };
}

export type ImportVocabularyState = {
  error: string | null;
  success: boolean;
  importedCount: number;
};

export async function importVocabularyAction(
  _prevState: ImportVocabularyState,
  formData: FormData,
): Promise<ImportVocabularyState> {
  const supabase = await createClient();

  const check = await requireTeacher(supabase);
  if ("error" in check) {
    return { error: check.error, success: false, importedCount: 0 };
  }

  const text = String(formData.get("bulk") ?? "");
  const parsed = parseBulkVocabularyInput(text);

  if (parsed.length === 0) {
    return { error: "Chưa nhập dữ liệu nào.", success: false, importedCount: 0 };
  }

  const failedLines = parsed.filter(
    (line): line is Extract<typeof parsed[number], { ok: false }> => !line.ok,
  );

  if (failedLines.length > 0) {
    const detail = failedLines
      .map((line) => `dòng ${line.lineNumber} ("${line.raw.trim()}")`)
      .join(", ");
    return {
      error: `Có ${failedLines.length} dòng chưa đúng định dạng: ${detail}. Chưa thêm từ nào, hãy sửa lại rồi thử lại.`,
      success: false,
      importedCount: 0,
    };
  }

  const items = parsed
    .filter((line): line is Extract<typeof parsed[number], { ok: true }> => line.ok)
    .map((line) => line.value);

  const { data, error } = await createVocabularyBulk(supabase, check.teacherId, items);
  if (error) return { error, success: false, importedCount: 0 };

  revalidatePath("/teacher/vocabulary");
  return { error: null, success: true, importedCount: data?.length ?? 0 };
}
