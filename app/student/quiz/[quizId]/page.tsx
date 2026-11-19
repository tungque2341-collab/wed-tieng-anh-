import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { getQuizForStudent } from "@/features/quiz/services/quiz-service";
import { QuizTaker } from "@/features/quiz/components/QuizTaker";
import Link from "next/link";

type PageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function StudentQuizTakePage({ params }: PageProps) {
  const { quizId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "student") {
    notFound();
  }

  // Lấy quiz cho học sinh (không có is_correct)
  const quizResult = await getQuizForStudent(supabase, quizId, user.id);

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
            <Link href={`/student/lessons/${lesson.id}/quiz`} className="hover:underline">
              ← Quiz bài học: {lesson.title}
            </Link>
          )}
        </nav>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <QuizTaker
          quizId={quiz.id}
          quizTitle={quiz.title}
          questions={quiz.questions}
          lessonId={quiz.lesson_id}
        />
      </main>
    </div>
  );
}