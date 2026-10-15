import type { SupabaseClient } from "@supabase/supabase-js";

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
