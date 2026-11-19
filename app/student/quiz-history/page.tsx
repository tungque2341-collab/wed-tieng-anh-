import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { listQuizHistory } from "@/features/quiz/services/quiz-history-service";
import { QuizHistory } from "@/features/quiz/components/QuizHistory";
import Link from "next/link";

export default async function StudentQuizHistoryPage() {
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

  const historyResult = await listQuizHistory(supabase, user.id);
  const history = historyResult.data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/student/lessons" className="text-sm text-zinc-600 hover:underline">
          ← Về bài học
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="mb-8 w-full max-w-2xl text-center">
          <h1 className="mb-1 text-2xl font-bold text-zinc-900">Lịch sử làm Quiz</h1>
          <p className="text-sm text-zinc-600">Xem lại các bài quiz bạn đã làm</p>
        </div>

        <QuizHistory history={history} />
      </main>
    </div>
  );
}