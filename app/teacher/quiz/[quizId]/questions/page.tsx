import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { getQuizWithQuestions } from "@/features/quiz/services/quiz-service";
import { QuizQuestionManager } from "@/features/quiz/components/QuizQuestionManager";
import Link from "next/link";

type PageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function TeacherQuizQuestionsPage({ params }: PageProps) {
  const { quizId } = await params;
  const supabase = await createClient();

  const quizResult = await getQuizWithQuestions(supabase, quizId);

  if (quizResult.error || !quizResult.data) {
    notFound();
  }

  const quiz = quizResult.data;

  // Lấy thông tin lesson để hiển thị breadcrumb
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("id", quiz.lesson_id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-zinc-600">
          {lesson && (
            <Link href={`/teacher/lessons/${lesson.id}/quiz`} className="hover:underline">
              ← Quiz bài học: {lesson.title}
            </Link>
          )}
        </nav>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="mb-8 w-full max-w-3xl text-center">
          <h1 className="mb-1 text-2xl font-bold text-zinc-900">Quản lý câu hỏi: {quiz.title}</h1>
          <p className="text-sm text-zinc-600">{quiz.questions.length} câu hỏi</p>
        </div>

        <QuizQuestionManager quizId={quizId} initialQuestions={quiz.questions} />
      </main>
    </div>
  );
}