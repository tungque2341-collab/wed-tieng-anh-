import type { SupabaseClient } from "@supabase/supabase-js";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export interface QuizHistoryItem {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quiz_title: string;
  lesson_title: string;
}

export interface QuizResultDetail {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quiz_title: string;
  lesson_title: string;
  questions: {
    id: string;
    question_text: string;
    order_index: number;
    answers: {
      id: string;
      answer_text: string;
      is_correct: boolean;
    }[];
    selected_answer_id: string | null;
    is_correct: boolean;
  }[];
}

/**
 * Lấy lịch sử làm quiz của học sinh
 */
export async function listQuizHistory(
  supabase: SupabaseClient,
  studentId: string,
  lessonId?: string,
): Promise<ServiceResult<QuizHistoryItem[]>> {
  let query = supabase
    .from("quiz_results")
    .select(`
      id,
      quiz_id,
      student_id,
      score,
      total_questions,
      completed_at,
      quizzes!inner (
        id,
        title,
        lesson_id,
        lessons!inner (
          id,
          title
        )
      )
    `)
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false });

  if (lessonId) {
    query = query.eq("quizzes.lesson_id", lessonId);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };

  const items: QuizHistoryItem[] = (data as any[]).map((row) => ({
    id: row.id,
    quiz_id: row.quiz_id,
    student_id: row.student_id,
    score: row.score,
    total_questions: row.total_questions,
    completed_at: row.completed_at,
    quiz_title: row.quizzes.title,
    lesson_title: row.quizzes.lessons.title,
  }));

  return { data: items, error: null };
}

/**
 * Lấy chi tiết kết quả một lần làm quiz
 */
export async function getQuizResultDetail(
  supabase: SupabaseClient,
  resultId: string,
  studentId: string,
): Promise<ServiceResult<QuizResultDetail>> {
  const { data: resultData, error: resultError } = await supabase
    .from("quiz_results")
    .select(`
      id,
      quiz_id,
      student_id,
      score,
      total_questions,
      completed_at,
      quizzes!inner (
        id,
        title,
        lesson_id,
        lessons!inner (
          id,
          title
        )
      )
    `)
    .eq("id", resultId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (resultError) return { data: null, error: resultError.message };
  if (!resultData) return { data: null, error: "Không tìm thấy kết quả." };

  // Lấy câu hỏi và đáp án của quiz này
  const { data: questionsData, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(`
      id,
      question_text,
      order_index,
      quiz_answers (
        id,
        answer_text,
        is_correct
      )
    `)
    .eq("quiz_id", resultData.quiz_id)
    .order("order_index");

  if (questionsError) return { data: null, error: questionsError.message };

  // Lấy câu trả lời của học sinh (từ quiz_results_details nếu có, hoặc tính toán lại)
  // Vì không lưu chi tiết câu trả lời trong schema hiện tại, hiển thị đáp án đúng
  const questions = (questionsData as any[]).map((q) => ({
    id: q.id,
    question_text: q.question_text,
    order_index: q.order_index,
    answers: q.quiz_answers.map((a: any) => ({
      id: a.id,
      answer_text: a.answer_text,
      is_correct: a.is_correct,
    })),
    selected_answer_id: null as string | null,
    is_correct: false,
  }));

  return {
    data: {
      id: resultData.id,
      quiz_id: resultData.quiz_id,
      student_id: resultData.student_id,
      score: resultData.score,
      total_questions: resultData.total_questions,
      completed_at: resultData.completed_at,
      quiz_title: resultData.quizzes.title,
      lesson_title: resultData.quizzes.lessons.title,
      questions,
    },
    error: null,
  };
}

/**
 * Lấy lịch sử làm quiz của học sinh cho một bài học cụ thể (dùng cho teacher dashboard)
 */
export async function listQuizHistoryForLesson(
  supabase: SupabaseClient,
  lessonId: string,
  studentId: string,
): Promise<ServiceResult<QuizHistoryItem[]>> {
  return listQuizHistory(supabase, studentId, lessonId);
}

/**
 * Lấy tất cả kết quả quiz của một bài học (dành cho giáo viên)
 */
export async function listQuizResultsForLesson(
  supabase: SupabaseClient,
  lessonId: string,
): Promise<ServiceResult<QuizHistoryItem[]>> {
  const { data, error } = await supabase
    .from("quiz_results")
    .select(`
      id,
      quiz_id,
      student_id,
      score,
      total_questions,
      completed_at,
      quizzes!inner (
        id,
        title,
        lesson_id,
        lessons!inner (
          id,
          title
        )
      ),
      profiles!inner (
        id,
        full_name,
        username
      )
    `)
    .eq("quizzes.lesson_id", lessonId)
    .order("completed_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const items: (QuizHistoryItem & { student_name: string; student_username: string | null })[] = (
    data as any[]
  ).map((row) => ({
    id: row.id,
    quiz_id: row.quiz_id,
    student_id: row.student_id,
    score: row.score,
    total_questions: row.total_questions,
    completed_at: row.completed_at,
    quiz_title: row.quizzes.title,
    lesson_title: row.quizzes.lessons.title,
    student_name: row.profiles.full_name,
    student_username: row.profiles.username,
  }));

  return { data: items, error: null };
}