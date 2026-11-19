import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vocabulary } from "@/types/vocabulary";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type FallingWord = Vocabulary & {
  audio_url: string | null;
};

/**
 * Lấy danh sách từ vựng cho game rơi (chỉ từ có audio/phonetic)
 */
export async function listFallingWordsForLesson(
  supabase: SupabaseClient,
  lessonId: string,
  studentId: string,
): Promise<ServiceResult<FallingWord[]>> {
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

  // Lọc từ có audio hoặc phonetic
  const wordsWithAudio = vocabItems.filter(
    (v) => v.audio_url || v.phonetic,
  );

  return { data: wordsWithAudio as FallingWord[], error: null };
}

/**
 * Lưu điểm game rơi từ
 */
export interface FallingWordsScore {
  id: string;
  student_id: string;
  lesson_id: string;
  score: number;
  words_correct: number;
  words_total: number;
  duration_seconds: number;
  created_at: string;
}

export async function saveFallingWordsScore(
  supabase: SupabaseClient,
  studentId: string,
  lessonId: string,
  score: number,
  wordsCorrect: number,
  wordsTotal: number,
  durationSeconds: number,
): Promise<ServiceResult<FallingWordsScore>> {
  const { data, error } = await supabase
    .from("falling_words_scores")
    .insert({
      student_id: studentId,
      lesson_id: lessonId,
      score,
      words_correct: wordsCorrect,
      words_total: wordsTotal,
      duration_seconds: durationSeconds,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FallingWordsScore, error: null };
}

/**
 * Lấy lịch sử điểm game rơi từ
 */
export async function listFallingWordsScores(
  supabase: SupabaseClient,
  studentId: string,
  lessonId?: string,
): Promise<ServiceResult<FallingWordsScore[]>> {
  let query = supabase
    .from("falling_words_scores")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (lessonId) {
    query = query.eq("lesson_id", lessonId);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };
  return { data: data as FallingWordsScore[], error: null };
}

/**
 * Lấy điểm cao nhất của học sinh cho bài học
 */
export async function getBestFallingWordsScore(
  supabase: SupabaseClient,
  studentId: string,
  lessonId: string,
): Promise<ServiceResult<FallingWordsScore | null>> {
  const { data, error } = await supabase
    .from("falling_words_scores")
    .select("*")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as FallingWordsScore | null, error: null };
}