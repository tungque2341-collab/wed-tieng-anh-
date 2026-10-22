import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { listLessons } from "@/features/lessons/services/lesson-service";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLessonsPage() {
  const supabase = await createClient();
  // RLS (Ngày 2) tự lọc: học sinh chỉ thấy bài học đã gán cho lớp của mình.
  const { data, error } = await listLessons(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/student" className="text-sm text-zinc-600 hover:underline">
          ← Về dashboard
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          Bài học của tôi
        </h1>

        <div className="w-full max-w-md">
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách bài học: {error}
            </p>
          ) : !data || data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-zinc-600">Chưa có bài học nào được giao.</p>
              <p className="mt-1 text-sm text-zinc-400">
                Hỏi giáo viên của bạn để được thêm vào lớp và giao bài.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <p className="text-sm font-medium text-zinc-900">
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {lesson.description}
                      </p>
                    )}
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
