"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTeacher } from "@/lib/auth/require-teacher";
import {
  createQuiz,
  addQuizQuestion,
  addQuizAnswer,
  deleteQuizQuestion,
  deleteQuizAnswer,
  updateQuizQuestion,
  updateQuizAnswer,
  submitQuiz,
} from "./services/quiz-service";

export type CreateQuizState = { error: string | null; quizId: string | null };
export type QuizActionState = { error: string | null; success: string | null };

const initialQuizActionState: QuizActionState = { error: null, success: null };

/** GV tạo quiz cho bài học */
export async function createQuizAction(
  _prevState: CreateQuizState,
  formData: FormData,
): Promise<CreateQuizState> {
  const lessonId = String(formData.get("lesson_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!lessonId || !title) {
    return { error: "Thiếu thông tin bài học hoặc tiêu đề.", quizId: null };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, quizId: null };

  const result = await createQuiz(auth.supabase, auth.teacherId, lessonId, title);
  if (result.error) return { error: result.error, quizId: null };

  revalidatePath(`/teacher/lessons/${lessonId}/quiz`);
  return { error: null, quizId: result.data!.id };
}

/** GV thêm câu hỏi vào quiz */
export async function addQuizQuestionAction(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const quizId = String(formData.get("quiz_id") ?? "");
  const questionText = String(formData.get("question_text") ?? "").trim();
  const orderIndex = Number(formData.get("order_index") ?? 0);

  if (!quizId || !questionText) {
    return { ...initialQuizActionState, error: "Thiếu quiz ID hoặc nội dung câu hỏi." };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, success: null };

  const result = await addQuizQuestion(auth.supabase, quizId, questionText, orderIndex);
  if (result.error) return { error: result.error, success: null };

  revalidatePath(`/teacher/quiz/${quizId}/questions`);
  return { error: null, success: "Đã thêm câu hỏi." };
}

/** GV thêm đáp án cho câu hỏi */
export async function addQuizAnswerAction(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const questionId = String(formData.get("question_id") ?? "");
  const answerText = String(formData.get("answer_text") ?? "").trim();
  const isCorrect = formData.get("is_correct") === "true";

  if (!questionId || !answerText) {
    return { ...initialQuizActionState, error: "Thiếu question ID hoặc nội dung đáp án." };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, success: null };

  const result = await addQuizAnswer(auth.supabase, questionId, answerText, isCorrect);
  if (result.error) return { error: result.error, success: null };

  revalidatePath(`/teacher/quiz/${questionId}/answers`); // Sẽ cần điều chỉnh path
  return { error: null, success: "Đã thêm đáp án." };
}

/** GV xóa câu hỏi */
export async function deleteQuizQuestionAction(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const questionId = String(formData.get("question_id") ?? "");
  const quizId = String(formData.get("quiz_id") ?? "");

  if (!questionId) {
    return { ...initialQuizActionState, error: "Thiếu question ID." };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, success: null };

  const result = await deleteQuizQuestion(auth.supabase, questionId);
  if (result.error) return { error: result.error, success: null };

  revalidatePath(`/teacher/quiz/${quizId}/questions`);
  return { error: null, success: "Đã xóa câu hỏi." };
}

/** GV xóa đáp án */
export async function deleteQuizAnswerAction(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const answerId = String(formData.get("answer_id") ?? "");
  const questionId = String(formData.get("question_id") ?? "");

  if (!answerId) {
    return { ...initialQuizActionState, error: "Thiếu answer ID." };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, success: null };

  const result = await deleteQuizAnswer(auth.supabase, answerId);
  if (result.error) return { error: result.error, success: null };

  revalidatePath(`/teacher/quiz/${questionId}/answers`);
  return { error: null, success: "Đã xóa đáp án." };
}

/** GV cập nhật câu hỏi */
export async function updateQuizQuestionAction(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const questionId = String(formData.get("question_id") ?? "");
  const questionText = String(formData.get("question_text") ?? "").trim();

  if (!questionId || !questionText) {
    return { ...initialQuizActionState, error: "Thiếu question ID hoặc nội dung." };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, success: null };

  const result = await updateQuizQuestion(auth.supabase, questionId, questionText);
  if (result.error) return { error: result.error, success: null };

  revalidatePath(`/teacher/quiz/${questionId}/questions`);
  return { error: null, success: "Đã cập nhật câu hỏi." };
}

/** GV cập nhật đáp án */
export async function updateQuizAnswerAction(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const answerId = String(formData.get("answer_id") ?? "");
  const answerText = String(formData.get("answer_text") ?? "").trim();
  const isCorrect = formData.get("is_correct") === "true";

  if (!answerId || !answerText) {
    return { ...initialQuizActionState, error: "Thiếu answer ID hoặc nội dung." };
  }

  const auth = await requireTeacher();
  if (!auth.ok) return { error: auth.error, success: null };

  const result = await updateQuizAnswer(auth.supabase, answerId, answerText, isCorrect);
  if (result.error) return { error: result.error, success: null };

  revalidatePath(`/teacher/quiz/${answerId}/answers`);
  return { error: null, success: "Đã cập nhật đáp án." };
}

/** HS nộp bài quiz */
export type SubmitQuizState = {
  error: string | null;
  result: { score: number; total: number; details: Array<{ questionId: string; correct: boolean }> } | null;
};

export async function submitQuizAction(
  _prevState: SubmitQuizState,
  formData: FormData,
): Promise<SubmitQuizState> {
  const quizId = String(formData.get("quiz_id") ?? "");
  const answersJson = String(formData.get("answers") ?? "{}");

  if (!quizId) {
    return { error: "Thiếu quiz ID.", result: null };
  }

  let answers: Record<string, string>;
  try {
    answers = JSON.parse(answersJson);
  } catch {
    return { error: "Dữ liệu đáp án không hợp lệ.", result: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập.", result: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "student") {
    return { error: "Chỉ học sinh mới được làm quiz.", result: null };
  }

  const result = await submitQuiz(supabase, user.id, quizId, answers);
  if (result.error) return { error: result.error, result: null };

  revalidatePath(`/student/lessons/*/quiz`);
  return { error: null, result: result.data! };
}