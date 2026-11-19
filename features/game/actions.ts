"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/features/auth/actions";
import { listFallingWordsForLesson, saveFallingWordsScore } from "./services/falling-words-service";
import type { FallingWord, FallingWordsScore } from "./services/falling-words-service";

export type FallingWordsResult = { words: FallingWord[]; error: string | null };
export type SaveScoreResult = { score: FallingWordsScore | null; error: string | null };

/**
 * Lấy danh sách từ vựng cho game rơi từ
 */
export async function getFallingWordsAction(
  lessonId: string,
): Promise<FallingWordsResult> {
  const student = await requireStudent();
  const supabase = await createClient();

  const result = await listFallingWordsForLesson(supabase, lessonId, student.id);

  if (result.error) return { words: [], error: result.error };
  return { words: result.data ?? [], error: null };
}

/**
 * Lưu điểm game rơi từ
 */
export async function saveFallingWordsScoreAction(
  formData: FormData,
): Promise<SaveScoreResult> {
  const student = await requireStudent();
  const supabase = await createClient();

  const lessonId = formData.get("lesson_id") as string;
  const score = parseInt(formData.get("score") as string, 10);
  const wordsCorrect = parseInt(formData.get("words_correct") as string, 10);
  const wordsTotal = parseInt(formData.get("words_total") as string, 10);
  const durationSeconds = parseInt(formData.get("duration_seconds") as string, 10);

  if (!lessonId || isNaN(score) || isNaN(wordsCorrect) || isNaN(wordsTotal) || isNaN(durationSeconds)) {
    return { score: null, error: "Thiếu thông tin bắt buộc." };
  }

  const result = await saveFallingWordsScore(
    supabase,
    student.id,
    lessonId,
    score,
    wordsCorrect,
    wordsTotal,
    durationSeconds,
  );

  if (result.error) return { score: null, error: result.error };
  return { score: result.data, error: null };
}