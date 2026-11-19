import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { listQuizzesForLesson, getQuizWithQuestions } from "@/features/quiz/services/quiz-service";
import { CreateQuizForm } from "@/features/quiz/components/CreateQuizForm";
import { QuizQuestionManager } from "@/features/quiz/components/QuizQuestionManager";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeacherQuizPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Kiểm tra bài học thuộc về GV này
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!lesson) {
    notFound();
  }

  // Lấy danh sách quiz của bài học
  const quizzesResult = await listQuizzesForLesson(supabase, id);
  const quizzes = quizzesResult.data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href={`/teacher/lessons/${id}`} className="text-sm text-zinc-600 hover:underline">
          ← Về bài học
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="mb-8 w-full max-w-3xl text-center">
          <h1 className="mb-1 text-2xl font-bold text-zinc-900">Quản lý Quiz: {lesson.title}</h1>
          <p className="text-sm text-zinc-600">Tạo và quản lý các bài kiểm tra cho bài học này</p>
        </div>

        {/* Form tạo quiz mới */}
        <div className="mb-8 w-full max-w-3xl rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Tạo Quiz mới</h2>
          <CreateQuizForm lessonId={id} />
        </div>

        {/* Danh sách quiz */}
        <div className="w-full max-w-3xl space-y-4">
          {quizzes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-zinc-600">Chưa có quiz nào cho bài học này.</p>
              <p className="mt-1 text-sm text-zinc-400">Hãy tạo quiz đầu tiên ở trên.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                  <Link
                    href={`/teacher/quiz/${quiz.id}/questions`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{quiz.title}</p>
                      <p className="text-sm text-zinc-500">
                        Tạo lúc: {new Date(quiz.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <span className="text-zinc-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}