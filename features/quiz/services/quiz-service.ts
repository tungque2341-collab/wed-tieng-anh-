import type { SupabaseClient } from "@supabase/supabase-js";

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type Quiz = {
  id: string;
  teacher_id: string;
  lesson_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type QuizWithQuestions = Quiz & {
  questions: QuizQuestion[];
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  order_index: number;
  created_at: string;
  answers: QuizAnswer[];
};

export type QuizAnswer = {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  created_at: string;
};

/** Danh sách quiz của một bài học (cho giáo viên) */
export async function listQuizzesForLesson(
  supabase: SupabaseClient,
  lessonId: string,
): Promise<ServiceResult<Quiz[]>> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Quiz[], error: null };
}

/** Tạo quiz mới cho bài học */
export async function createQuiz(
  supabase: SupabaseClient,
  teacherId: string,
  lessonId: string,
  title: string,
): Promise<ServiceResult<Quiz>> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return { data: null, error: "Tiêu đề quiz không được để trống." };

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      teacher_id: teacherId,
      lesson_id: lessonId,
      title: trimmedTitle,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Quiz, error: null };
}

/** Lấy chi tiết quiz kèm câu hỏi và đáp án (cho giáo viên) */
export async function getQuizWithQuestions(
  supabase: SupabaseClient,
  quizId: string,
): Promise<ServiceResult<QuizWithQuestions | null>> {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();

  if (quizError) return { data: null, error: quizError.message };
  if (!quiz) return { data: null, error: null };

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("*, quiz_answers(*)")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  if (qError) return { data: null, error: qError.message };

  const questionsWithAnswers = (questions ?? []).map((q) => ({
    ...q,
    answers: (q.quiz_answers ?? []).sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)),
  }));

  return { data: { ...quiz, questions: questionsWithAnswers }, error: null };
}

/** Lấy quiz để học sinh làm bài (KHÔNG bao gồm is_correct) */
export async function getQuizForStudent(
  supabase: SupabaseClient,
  quizId: string,
  studentId: string,
): Promise<ServiceResult<Omit<QuizWithQuestions, "questions"> & {
  questions: (Omit<QuizQuestion, "answers"> & {
    answers: Omit<QuizAnswer, "is_correct">[];
  })[];
} | null>> {
  // Kiểm tra học sinh có quyền xem quiz này không (qua lesson -> lesson_classes -> class_students)
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*, lessons!inner(lesson_classes!inner(class_students!inner(student_id))))")
    .eq("id", quizId)
    .eq("lessons.lesson_classes.class_students.student_id", studentId)
    .maybeSingle();

  if (quizError) return { data: null, error: quizError.message };
  if (!quiz) return { data: null, error: "Không tìm thấy quiz hoặc bạn không có quyền truy cập." };

  const quizData = quiz as unknown as Quiz;

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question_text, order_index, created_at, quiz_answers(id, question_id, answer_text, created_at)")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  if (qError) return { data: null, error: qError.message };

  const questionsForStudent = (questions ?? []).map((q: any) => ({
    id: q.id,
    quiz_id: q.quiz_id,
    question_text: q.question_text,
    order_index: q.order_index,
    created_at: q.created_at,
    answers: (q.quiz_answers ?? []).map((a: any) => ({
      id: a.id,
      question_id: a.question_id,
      answer_text: a.answer_text,
      created_at: a.created_at,
    })),
  }));

  return {
    data: {
      id: quizData.id,
      teacher_id: quizData.teacher_id,
      lesson_id: quizData.lesson_id,
      title: quizData.title,
      created_at: quizData.created_at,
      updated_at: quizData.updated_at,
      questions: questionsForStudent,
    },
    error: null,
  };
}

/** Thêm câu hỏi vào quiz */
export async function addQuizQuestion(
  supabase: SupabaseClient,
  quizId: string,
  questionText: string,
  orderIndex: number,
): Promise<ServiceResult<QuizQuestion>> {
  const trimmed = questionText.trim();
  if (!trimmed) return { data: null, error: "Nội dung câu hỏi không được để trống." };

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      question_text: trimmed,
      order_index: orderIndex,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as QuizQuestion, error: null };
}

/** Thêm đáp án cho câu hỏi */
export async function addQuizAnswer(
  supabase: SupabaseClient,
  questionId: string,
  answerText: string,
  isCorrect: boolean,
): Promise<ServiceResult<QuizAnswer>> {
  const trimmed = answerText.trim();
  if (!trimmed) return { data: null, error: "Nội dung đáp án không được để trống." };

  const { data, error } = await supabase
    .from("quiz_answers")
    .insert({
      question_id: questionId,
      answer_text: trimmed,
      is_correct: isCorrect,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as QuizAnswer, error: null };
}

/** Xóa câu hỏi (cascade xóa đáp án nhờ FK) */
export async function deleteQuizQuestion(
  supabase: SupabaseClient,
  questionId: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/** Xóa đáp án */
export async function deleteQuizAnswer(
  supabase: SupabaseClient,
  answerId: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase.from("quiz_answers").delete().eq("id", answerId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/** Cập nhật câu hỏi */
export async function updateQuizQuestion(
  supabase: SupabaseClient,
  questionId: string,
  questionText: string,
): Promise<ServiceResult<QuizQuestion>> {
  const trimmed = questionText.trim();
  if (!trimmed) return { data: null, error: "Nội dung câu hỏi không được để trống." };

  const { data, error } = await supabase
    .from("quiz_questions")
    .update({ question_text: trimmed })
    .eq("id", questionId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as QuizQuestion, error: null };
}

/** Cập nhật đáp án */
export async function updateQuizAnswer(
  supabase: SupabaseClient,
  answerId: string,
  answerText: string,
  isCorrect: boolean,
): Promise<ServiceResult<QuizAnswer>> {
  const trimmed = answerText.trim();
  if (!trimmed) return { data: null, error: "Nội dung đáp án không được để trống." };

  const { data, error } = await supabase
    .from("quiz_answers")
    .update({ answer_text: trimmed, is_correct: isCorrect })
    .eq("id", answerId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as QuizAnswer, error: null };
}

/** Nộp bài quiz - chấm điểm server-side */
export async function submitQuiz(
  supabase: SupabaseClient,
  studentId: string,
  quizId: string,
  answers: Record<string, string>, // question_id -> answer_id
): Promise<ServiceResult<{ score: number; total: number; details: Array<{ questionId: string; correct: boolean }> }>> {
  // Lấy đáp án đúng từ DB
  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("id, quiz_answers!inner(id, is_correct)")
    .eq("quiz_id", quizId);

  if (qError) return { data: null, error: qError.message };

  let score = 0;
  const details: Array<{ questionId: string; correct: boolean }> = [];

  for (const question of questions ?? []) {
    const studentAnswerId = answers[question.id];
    const correctAnswer = (question.quiz_answers as { id: string; is_correct: boolean }[]).find(
      (a) => a.is_correct,
    );
    const isCorrect = studentAnswerId === correctAnswer?.id;
    if (isCorrect) score++;
    details.push({ questionId: question.id, correct: isCorrect });
  }

  const total = (questions ?? []).length;

  // Lưu kết quả
  const { error: insertError } = await supabase.from("quiz_results").insert({
    quiz_id: quizId,
    student_id: studentId,
    score,
    total_questions: total,
  });

  if (insertError) return { data: null, error: insertError.message };

  return { data: { score, total, details }, error: null };
}

/** Lấy lịch sử làm quiz của học sinh */
export async function listQuizResultsForStudent(
  supabase: SupabaseClient,
  studentId: string,
  quizId?: string,
): Promise<ServiceResult<Array<{
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  completed_at: string;
}>>> {
  let query = supabase
    .from("quiz_results")
    .select("*, quizzes(title)")
    .eq("student_id", studentId)
    .order("completed_at", { ascending: false });

  if (quizId) {
    query = query.eq("quiz_id", quizId);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };

  const results = (data ?? []).map((r) => ({
    id: r.id,
    quiz_id: r.quiz_id,
    quiz_title: (r.quizzes as { title: string })?.title ?? "Quiz",
    score: r.score,
    total_questions: r.total_questions,
    completed_at: r.completed_at,
  }));

  return { data: results, error: null };
}