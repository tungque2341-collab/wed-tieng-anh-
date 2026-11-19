import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { listQuizResultsForLesson } from "@/features/quiz/services/quiz-history-service";
import Link from "next/link";

export default async function TeacherDashboardPage() {
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

  if (profile?.role !== "teacher") {
    notFound();
  }

  // Lấy các lớp của giáo viên
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  // Lấy các bài học của giáo viên
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, description, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  // Lấy số lượng học sinh (tổng)
  const { count: totalStudents } = await supabase
    .from("class_students")
    .select("student_id", { count: "exact", head: true })
    .in(
      "class_id",
      classes?.map((c) => c.id) ?? []
    );

  // Lấy số quiz
  const { count: totalQuizzes } = await supabase
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", user.id);

  // Lấy từ vựng
  const { count: totalVocabulary } = await supabase
    .from("vocabulary")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", user.id);

  // Lấy kết quả quiz gần đây (tất cả bài học của giáo viên)
  const lessonIds = lessons?.map((l) => l.id) ?? [];
  let recentQuizResults: any[] = [];
  if (lessonIds.length > 0) {
    const { data: quizResults } = await supabase
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
      .in("quizzes.lesson_id", lessonIds)
      .order("completed_at", { ascending: false })
      .limit(10);
    recentQuizResults = quizResults ?? [];
  }

  // Thống kê trung bình điểm quiz
  const avgQuizScore = recentQuizResults.length > 0
    ? Math.round(
        (recentQuizResults.reduce((sum, q) => sum + q.score, 0) /
          recentQuizResults.reduce((sum, q) => sum + q.total_questions, 0)) *
          100
      )
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-zinc-900">Bảng điều khiển Giáo viên</h1>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="w-full max-w-6xl space-y-6">
          {/* Welcome */}
          <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-bold">Chào mừng, {profile.full_name}!</h2>
            <p className="mt-1 text-indigo-100">Quản lý lớp học, bài học và theo dõi tiến độ học sinh.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/teacher/classes"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Số lớp học</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{classes?.length ?? 0}</p>
            </Link>

            <Link
              href="/teacher/lessons"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Số bài học</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{lessons?.length ?? 0}</p>
            </Link>

            <Link
              href="/teacher/vocabulary"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Từ vựng</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{totalVocabulary ?? 0}</p>
            </Link>

            <Link
              href="/teacher/quiz"
              className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
            >
              <p className="text-sm text-zinc-500">Quiz đã tạo</p>
              <p className="mt-1 text-3xl font-bold text-zinc-900">{totalQuizzes ?? 0}</p>
            </Link>
          </div>

          {/* Classes Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Classes */}
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">Các lớp của bạn</h2>
                <Link
                  href="/teacher/classes"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quản lý
                </Link>
              </div>
              {classes && classes.length > 0 ? (
                <div className="divide-y divide-zinc-200">
                  {classes.slice(0, 5).map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/teacher/classes/${cls.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">{cls.name}</p>
                        <p className="text-sm text-zinc-500">
                          Tạo: {new Date(cls.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span className="text-zinc-400">→</span>
                    </Link>
                  ))}
                  {classes.length > 5 && (
                    <div className="px-6 py-3 text-center text-sm text-zinc-500">
                      Và {classes.length - 5} lớp khác...
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-zinc-600">Chưa có lớp học nào.</p>
                  <Link
                    href="/teacher/classes/new"
                    className="mt-2 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Tạo lớp học đầu tiên
                  </Link>
                </div>
              )}
            </section>

            {/* Recent Lessons */}
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">Bài học gần đây</h2>
                <Link
                  href="/teacher/lessons"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quản lý
                </Link>
              </div>
              {lessons && lessons.length > 0 ? (
                <div className="divide-y divide-zinc-200">
                  {lessons.slice(0, 5).map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/teacher/lessons/${lesson.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">{lesson.title}</p>
                        <p className="text-sm text-zinc-500">
                          Tạo: {new Date(lesson.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span className="text-zinc-400">→</span>
                    </Link>
                  ))}
                  {lessons.length > 5 && (
                    <div className="px-6 py-3 text-center text-sm text-zinc-500">
                      Và {lessons.length - 5} bài học khác...
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-zinc-600">Chưa có bài học nào.</p>
                  <Link
                    href="/teacher/lessons/new"
                    className="mt-2 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Tạo bài học đầu tiên
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Recent Quiz Results */}
          {recentQuizResults.length > 0 && (
            <section className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">Kết quả quiz gần đây của học sinh</h2>
                <Link
                  href="/teacher/quiz-results"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Học sinh</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Quiz</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Bài học</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Điểm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {recentQuizResults.map((result) => {
                      const percentage = Math.round(
                        (result.score / result.total_questions) * 100
                      );
                      return (
                        <tr key={result.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-zinc-900">{result.profiles.full_name}</p>
                            {result.profiles.username && (
                              <p className="text-xs text-zinc-400">@{result.profiles.username}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-700">{result.quizzes.title}</td>
                          <td className="px-4 py-3 text-zinc-700">{result.quizzes.lessons.title}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                percentage >= 60
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {percentage}% ({result.score}/{result.total_questions})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-500">
                            {new Date(result.completed_at).toLocaleString("vi-VN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Link
                href="/teacher/classes/new"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                ➕ Tạo lớp học
              </Link>
              <Link
                href="/teacher/lessons/new"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                📝 Tạo bài học
              </Link>
              <Link
                href="/teacher/vocabulary/new"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                📚 Thêm từ vựng
              </Link>
              <Link
                href="/teacher/lessons"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                ❓ Tạo Quiz
              </Link>
              <Link
                href="/teacher/quiz-results"
                className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                📊 Xem kết quả
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}