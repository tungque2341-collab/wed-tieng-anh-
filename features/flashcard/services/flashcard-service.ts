import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vocabulary } from "@/types/vocabulary";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type FlashcardWithProgress = Vocabulary & {
  progress_status: "new" | "learning" | "mastered" | null;
  last_reviewed_at: string | null;
};

/**
 * Lấy danh sách flashcard cho một bài học, kèm tiến độ học của học sinh hiện tại.
 * Chỉ học sinh được gán bài học này (qua RLS) mới xem được.
 */
export async function listFlashcardsForLesson(
  supabase: SupabaseClient,
  lessonId: string,
  studentId: string,
): Promise<ServiceResult<FlashcardWithProgress[]>> {
  // Lấy từ vựng trong bài học (RLS tự lọc can_see_lesson)
  const { data: vocabData, error: vocabError } = await supabase
    .from("lesson_vocabulary")
    .select("vocabulary(*)")
    .eq("lesson_id", lessonId);

  if (vocabError) return { data: null, error: vocabError.message };

  const vocabItems = (vocabData as unknown as { vocabulary: Vocabulary }[]).map(
    (row) => row.vocabulary,
  );

  if (vocabItems.length === 0) {
    return { data: [], error: null };
  }

  // Lấy tiến độ học của học sinh cho các từ này
  const vocabIds = vocabItems.map((v) => v.id);
  const { data: progressData, error: progressError } = await supabase
    .from("learning_progress")
    .select("vocabulary_id, status, last_reviewed_at")
    .eq("student_id", studentId)
    .in("vocabulary_id", vocabIds);

  if (progressError) return { data: null, error: progressError.message };

  const progressMap = new Map(
    (progressData ?? []).map((p) => [p.vocabulary_id, p]),
  );

  const results: FlashcardWithProgress[] = vocabItems.map((vocab) => {
    const progress = progressMap.get(vocab.id);
    return {
      ...vocab,
      progress_status: progress?.status ?? null,
      last_reviewed_at: progress?.last_reviewed_at ?? null,
    };
  });

  // Sắp xếp: mới -> đang học -> thành thạo -> chưa có tiến độ
  const statusOrder: Record<string, number> = { new: 0, learning: 1, mastered: 2, null: 3 };
  results.sort((a, b) => (statusOrder[a.progress_status ?? "null"] ?? 3) - (statusOrder[b.progress_status ?? "null"] ?? 3));

  return { data: results, error: null };
}

/**
 * Cập nhật tiến độ học từ vựng (dùng cho Flashcard spaced repetition).
 * SM-2 simplified: new -> learning -> mastered.
 * Nếu trả lời đúng: new->learning, learning->mastered, mastered->mastered.
 * Nếu trả lời sai: learning->new, mastered->learning.
 */
export async function updateLearningProgress(
  supabase: SupabaseClient,
  studentId: string,
  vocabularyId: string,
  isCorrect: boolean,
): Promise<ServiceResult<{ status: "new" | "learning" | "mastered" }>> {
  // Lấy tiến độ hiện tại
  const { data: current, error: fetchError } = await supabase
    .from("learning_progress")
    .select("status")
    .eq("student_id", studentId)
    .eq("vocabulary_id", vocabularyId)
    .maybeSingle();

  if (fetchError) return { data: null, error: fetchError.message };

  const currentStatus = current?.status ?? "new";
  let newStatus: "new" | "learning" | "mastered";

  if (isCorrect) {
    if (currentStatus === "new") newStatus = "learning";
    else if (currentStatus === "learning") newStatus = "mastered";
    else newStatus = "mastered";
  } else {
    if (currentStatus === "mastered") newStatus = "learning";
    else newStatus = "new";
  }

  const { error: upsertError } = await supabase.from("learning_progress").upsert({
    student_id: studentId,
    vocabulary_id: vocabularyId,
    status: newStatus,
    last_reviewed_at: new Date().toISOString(),
  });

  if (upsertError) return { data: null, error: upsertError.message };

  return { data: { status: newStatus }, error: null };
}