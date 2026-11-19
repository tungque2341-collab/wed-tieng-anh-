"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { listFlashcardsForLesson, updateLearningProgress } from "./services/flashcard-service";

export type StudyFlashcardState = {
  error: string | null;
  newStatus: "new" | "learning" | "mastered" | null;
};

/**
 * Server Action: Học sinh cập nhật tiến độ khi học flashcard.
 * Chạy phía server để an toàn, không lộ logic chấm điểm ra client.
 */
export async function studyFlashcardAction(
  _prevState: StudyFlashcardState,
  formData: FormData,
): Promise<StudyFlashcardState> {
  const lessonId = String(formData.get("lesson_id") ?? "");
  const vocabularyId = String(formData.get("vocabulary_id") ?? "");
  const isCorrect = formData.get("is_correct") === "true";

  if (!lessonId || !vocabularyId) {
    return { error: "Thiếu tham số bài học hoặc từ vựng.", newStatus: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập.", newStatus: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "student") {
    return { error: "Chỉ học sinh mới được học flashcard.", newStatus: null };
  }

  const result = await updateLearningProgress(supabase, user.id, vocabularyId, isCorrect);

  if (result.error) {
    return { error: result.error, newStatus: null };
  }

  // Revalidate trang flashcard của bài học này
  revalidatePath(`/student/lessons/${lessonId}/flashcard`);

  return { error: null, newStatus: result.data!.status };
}