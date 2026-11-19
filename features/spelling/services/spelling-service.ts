import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vocabulary } from "@/types/vocabulary";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type SpellingWord = Vocabulary & {
  audio_url: string | null;
};

/**
 * Lấy danh sách từ vựng cho bài học (dùng cho chế độ đánh vần)
 * Chỉ lấy từ có audio_url hoặc phonetic (để học sinh có thể nghe)
 */
export async function listSpellingWordsForLesson(
  supabase: SupabaseClient,
  lessonId: string,
  studentId: string,
): Promise<ServiceResult<SpellingWord[]>> {
  // Kiểm tra học sinh có quyền xem bài học này không
  const { data: lessonCheck } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lessonCheck) {
    return { data: null, error: "Không tìm thấy bài học." };
  }

  // Lấy từ vựng trong bài học
  const { data: vocabData, error: vocabError } = await supabase
    .from("lesson_vocabulary")
    .select("vocabulary(*)")
    .eq("lesson_id", lessonId);

  if (vocabError) return { data: null, error: vocabError.message };

  const vocabItems = (vocabData as unknown as { vocabulary: Vocabulary }[]).map(
    (row) => row.vocabulary,
  );

  // Lọc từ có audio hoặc phonetic (có thể phát âm)
  const wordsWithAudio = vocabItems.filter(
    (v) => v.audio_url || v.phonetic,
  );

  return { data: wordsWithAudio as SpellingWord[], error: null };
}

/**
 * Lưu kết quả đánh vần (optional - để tracking tiến độ)
 */
export interface SpellingAttempt {
  id: string;
  student_id: string;
  vocabulary_id: string;
  lesson_id: string;
  is_correct: boolean;
  user_answer: string;
  attempts: number;
  created_at: string;
}

export async function saveSpellingAttempt(
  supabase: SupabaseClient,
  studentId: string,
  vocabularyId: string,
  lessonId: string,
  isCorrect: boolean,
  userAnswer: string,
  attempts: number,
): Promise<ServiceResult<SpellingAttempt>> {
  const { data, error } = await supabase
    .from("spelling_attempts")
    .insert({
      student_id: studentId,
      vocabulary_id: vocabularyId,
      lesson_id: lessonId,
      is_correct: isCorrect,
      user_answer: userAnswer,
      attempts,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SpellingAttempt, error: null };
}

/**
 * Lấy lịch sử đánh vần của học sinh cho một bài học
 */
export async function listSpellingHistory(
  supabase: SupabaseClient,
  studentId: string,
  lessonId: string,
): Promise<ServiceResult<SpellingAttempt[]>> {
  const { data, error } = await supabase
    .from("spelling_attempts")
    .select("*")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as SpellingAttempt[], error: null };
}