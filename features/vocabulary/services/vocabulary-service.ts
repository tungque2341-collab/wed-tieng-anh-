import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewVocabulary, Vocabulary, VocabularyUpdate } from "@/types/vocabulary";

/**
 * Lớp Service: chỉ lo việc đọc/ghi dữ liệu từ vựng qua Supabase.
 * Không biết gì về UI. RLS (Ngày 2) tự lo việc mỗi giáo viên chỉ thấy
 * từ vựng của mình — các hàm dưới đây không cần tự lọc theo teacher_id
 * khi SELECT/UPDATE/DELETE.
 */

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type VocabularySortOption = "newest" | "word_asc" | "word_desc";

export type ListVocabularyOptions = {
  /** Tìm theo "từ" hoặc "nghĩa" (không phân biệt hoa thường) */
  search?: string;
  sortBy?: VocabularySortOption;
};

/**
 * Lấy từ vựng của giáo viên đang đăng nhập, có thể tìm kiếm + sắp xếp.
 *
 * Khi có `search`: chạy 2 truy vấn riêng (theo "word" và theo "meaning")
 * rồi gộp + loại trùng ở phía ứng dụng, thay vì ráp 1 chuỗi `.or(...)`.
 * Lý do: cú pháp `.or()` của Supabase cần người viết tự escape dấu phẩy/
 * ngoặc trong giá trị tìm kiếm (nếu không sẽ vỡ cú pháp lọc) — tách thành
 * 2 truy vấn đơn giản, dễ đọc và không có rủi ro đó.
 */
export async function listVocabulary(
  supabase: SupabaseClient,
  options?: ListVocabularyOptions,
): Promise<ServiceResult<Vocabulary[]>> {
  const search = options?.search?.trim();
  const sortBy = options?.sortBy ?? "newest";

  if (!search) {
    let query = supabase.from("vocabulary").select("*");
    query =
      sortBy === "word_asc"
        ? query.order("word", { ascending: true })
        : sortBy === "word_desc"
          ? query.order("word", { ascending: false })
          : query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: data as Vocabulary[], error: null };
  }

  const [byWord, byMeaning] = await Promise.all([
    supabase.from("vocabulary").select("*").ilike("word", `%${search}%`),
    supabase.from("vocabulary").select("*").ilike("meaning", `%${search}%`),
  ]);

  if (byWord.error) return { data: null, error: byWord.error.message };
  if (byMeaning.error) return { data: null, error: byMeaning.error.message };

  const merged = new Map<string, Vocabulary>();
  for (const row of [
    ...((byWord.data ?? []) as Vocabulary[]),
    ...((byMeaning.data ?? []) as Vocabulary[]),
  ]) {
    merged.set(row.id, row);
  }

  const results = Array.from(merged.values());
  results.sort((a, b) => {
    if (sortBy === "word_asc") return a.word.localeCompare(b.word);
    if (sortBy === "word_desc") return b.word.localeCompare(a.word);
    return b.created_at.localeCompare(a.created_at); // mới nhất trước
  });

  return { data: results, error: null };
}

/** Lấy 1 từ vựng theo id (trả về null nếu không có hoặc không có quyền xem) */
export async function getVocabularyById(
  supabase: SupabaseClient,
  id: string,
): Promise<ServiceResult<Vocabulary | null>> {
  const { data, error } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as Vocabulary | null, error: null };
}

/**
 * Tạo từ vựng mới cho một giáo viên.
 * teacherId truyền vào riêng (không lấy từ session trong hàm này) để
 * lớp Service không tự gọi auth — việc xác thực do lớp gọi nó lo
 * (Server Action ở Ngày 9).
 */
export async function createVocabulary(
  supabase: SupabaseClient,
  teacherId: string,
  input: NewVocabulary,
): Promise<ServiceResult<Vocabulary>> {
  const word = input.word.trim();
  const meaning = input.meaning.trim();

  if (!word) return { data: null, error: "Từ vựng không được để trống." };
  if (!meaning) return { data: null, error: "Nghĩa không được để trống." };

  const { data, error } = await supabase
    .from("vocabulary")
    .insert({
      teacher_id: teacherId,
      word,
      meaning,
      phonetic: input.phonetic?.trim() || null,
      example: input.example?.trim() || null,
      image_url: input.image_url?.trim() || null,
      audio_url: input.audio_url?.trim() || null,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Vocabulary, error: null };
}

/** Sửa một từ vựng đã có (RLS chỉ cho sửa từ vựng của chính giáo viên đó) */
export async function updateVocabulary(
  supabase: SupabaseClient,
  id: string,
  input: VocabularyUpdate,
): Promise<ServiceResult<Vocabulary>> {
  if (input.word !== undefined && !input.word.trim()) {
    return { data: null, error: "Từ vựng không được để trống." };
  }
  if (input.meaning !== undefined && !input.meaning.trim()) {
    return { data: null, error: "Nghĩa không được để trống." };
  }

  const patch: Record<string, string | null> = {};
  if (input.word !== undefined) patch.word = input.word.trim();
  if (input.meaning !== undefined) patch.meaning = input.meaning.trim();
  if (input.phonetic !== undefined) patch.phonetic = input.phonetic?.trim() || null;
  if (input.example !== undefined) patch.example = input.example?.trim() || null;
  if (input.image_url !== undefined) patch.image_url = input.image_url?.trim() || null;
  if (input.audio_url !== undefined) patch.audio_url = input.audio_url?.trim() || null;

  const { data, error } = await supabase
    .from("vocabulary")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Vocabulary, error: null };
}

/** Xóa một từ vựng (RLS chỉ cho xóa từ vựng của chính giáo viên đó) */
export async function deleteVocabulary(
  supabase: SupabaseClient,
  id: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase.from("vocabulary").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
