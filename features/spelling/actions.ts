"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/features/auth/actions";
import { listSpellingWordsForLesson, saveSpellingAttempt } from "./services/spelling-service";
import type { SpellingWord, SpellingAttempt } from "./services/spelling-service";

export type SpellingWordsResult = { words: SpellingWord[]; error: string | null };
export type SaveAttemptResult = { attempt: SpellingAttempt | null; error: string | null };

/**
 * Lấy danh sách từ vựng cho bài học (dùng cho chế độ đánh vần)
 */
export async function getSpellingWordsAction(
  lessonId: string,
): Promise<SpellingWordsResult> {
  const student = await requireStudent();
  const supabase = await createClient();

  const result = await listSpellingWordsForLesson(supabase, lessonId, student.id);

  if (result.error) return { words: [], error: result.error };
  return { words: result.data, error: null };
}

/**
 * Lưu kết quả đánh vần một từ
 */
export async function saveSpellingAttemptAction(
  formData: FormData,
): Promise<SaveAttemptResult> {
  const student = await requireStudent();
  const supabase = await createClient();

  const vocabularyId = formData.get("vocabulary_id") as string;
  const lessonId = formData.get("lesson_id") as string;
  const isCorrect = formData.get("is_correct") === "true";
  const userAnswer = formData.get("user_answer") as string;
  const attempts = parseInt(formData.get("attempts") as string, 10) || 1;

  if (!vocabularyId || !lessonId || !userAnswer) {
    return { attempt: null, error: "Thiếu thông tin bắt buộc." };
  }

  const result = await saveSpellingAttempt(
    supabase,
    student.id,
    vocabularyId,
    lessonId,
    isCorrect,
    userAnswer,
    attempts,
  );

  if (result.error) return { attempt: null, error: result.error };
  return { attempt: result.data, error: null };
}