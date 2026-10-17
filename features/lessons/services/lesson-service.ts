import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vocabulary } from "@/types/vocabulary";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type Lesson = {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

/** Lấy danh sách bài học của giáo viên đang đăng nhập, mới nhất trước */
export async function listLessons(
  supabase: SupabaseClient,
): Promise<ServiceResult<Lesson[]>> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Lesson[], error: null };
}

/** Lấy 1 bài học theo id (null nếu không có hoặc không có quyền xem) */
export async function getLessonById(
  supabase: SupabaseClient,
  id: string,
): Promise<ServiceResult<Lesson | null>> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as Lesson | null, error: null };
}

export async function createLesson(
  supabase: SupabaseClient,
  teacherId: string,
  input: { title: string; description?: string | null },
): Promise<ServiceResult<Lesson>> {
  const title = input.title.trim();
  if (!title) return { data: null, error: "Tiêu đề bài học không được để trống." };

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      teacher_id: teacherId,
      title,
      description: input.description?.trim() || null,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Lesson, error: null };
}

/** Từ vựng đã gán vào 1 bài học cụ thể */
export async function listVocabularyInLesson(
  supabase: SupabaseClient,
  lessonId: string,
): Promise<ServiceResult<Vocabulary[]>> {
  const { data, error } = await supabase
    .from("lesson_vocabulary")
    .select("vocabulary(*)")
    .eq("lesson_id", lessonId);

  if (error) return { data: null, error: error.message };

  const items = (data as unknown as { vocabulary: Vocabulary }[]).map(
    (row) => row.vocabulary,
  );
  return { data: items, error: null };
}

export async function addVocabularyToLesson(
  supabase: SupabaseClient,
  lessonId: string,
  vocabularyId: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from("lesson_vocabulary")
    .insert({ lesson_id: lessonId, vocabulary_id: vocabularyId });

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "Từ này đã có trong bài học rồi." };
    }
    return { data: null, error: error.message };
  }
  return { data: true, error: null };
}

export async function removeVocabularyFromLesson(
  supabase: SupabaseClient,
  lessonId: string,
  vocabularyId: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from("lesson_vocabulary")
    .delete()
    .eq("lesson_id", lessonId)
    .eq("vocabulary_id", vocabularyId);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
