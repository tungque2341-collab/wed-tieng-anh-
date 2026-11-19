import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { listQuizHistory } from "@/features/quiz/services/quiz-history-service";
import { listSpellingHistory } from "@/features/spelling/services/spelling-service";
import Link from "next/link";

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "student") {
    notFound();
  }

  // Lấy các lớp của học sinh
  const { data: classStudents } = await supabase
    .from("class_students")
    .select(`
      class_id,
      classes (
        id,
        name,
        teacher_id,
        profiles!inner (full_name)
      )
    `)
    .eq("student_id", user.id);

  const classes = (classStudents ?? []).map((cs) => cs.classes);

  // Lấy các bài học của các lớp
  const lessonIds = classes.flatMap((c: any) =>
    // Cần query lesson_classes để lấy lesson_id
    []
  );

  // Lấy lịch sử quiz gần đây
  const quizHistoryResult = await listQuizHistory(supabase, user.id);
  const recentQuizHistory = (quizHistoryResult.data ?? []).slice(0, 5);

  // Lấy lịch sử đánh vần gần đây
  const spellingHistoryResult = await listSpellingHistory(supabase, user.id);
  const recentSpellingHistory = (spellingHistoryResult.data ?? []).slice(0, 5);

  // Thống kê
  const totalQuizzes = quizHistoryResult.data?.length ?? 0;
  const avgQuizScore = totalQuizzes > 0
    ? Math.round(
        (quizHistoryResult.data!.reduce((sum, q) => sum + q.score, 0) /
          quizHistoryResult.data!.reduce((sum, q) => sum + q.total_questions, 0)) *
          100
      )
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-zinc-900">Bảng điều khiển</h1>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Welcome */}
          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-xl font-bold">Chào mừng, {profile.full_name}!</h2>
            <p className="mt-1 text-blue-100">Tiếp tục hành trình học tiếng Anh của bạn nhé.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/student/lessons"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Số lớp học</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{classes.length}</p>
            </Link>

            <Link
              href="/student/quiz-history"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Quiz đã làm</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{totalQuizzes}</p>
            </Link>

            <Link
              href="/student/quiz-history"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Điểm trung bình</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{avgQuizScore}%</p>
            </Link>

            <Link
              href="/student/lessons"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Từ vựng đã học</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">
                {recentSpellingHistory.length}
              </p>
            </Link>
          </div>

          {/* My Classes */}
          {classes.length > 0 && (
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">Các lớp của bạn</h2>
              </div>
              <div className="divide-y divide-zinc-200">
                {classes.map((cls: any) => (
                  <Link
                    key={cls.id}
                    href={`/student/lessons?class=${cls.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{cls.name}</p>
                      <p className="text-sm text-zinc-500">Giáo viên: {cls.profiles.full_name}</p>
                    </div>
                    <span className="text-zinc-400">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Quiz History */}
          {recentQuizHistory.length > 0 && (
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">Quiz gần đây</h2>
                <Link
                  href="/student/quiz-history"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="divide-y divide-zinc-200">
                {recentQuizHistory.map((item) => (
                  <Link
                    key={item.id}
                    href={`/student/quiz/${item.quiz_id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{item.quiz_title}</p>
                      <p className="text-sm text-zinc-500">
                        {item.lesson_title} • {new Date(item.completed_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">
                        {Math.round((item.score / item.total_questions) * 100)}%
                      </p>
                      <p className="text-xs text-zinc-500">{item.score}/{item.total_questions}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Truy cập nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                href="/student/lessons"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                📚 Xem bài học
              </Link>
              <Link
                href="/student/quiz-history"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                📜 Lịch sử Quiz
              </Link>
              <Link
                href="/student/lessons"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                🎴 Flashcard
              </Link>
              <Link
                href="/student/lessons"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                ✍️ Đánh vần
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}