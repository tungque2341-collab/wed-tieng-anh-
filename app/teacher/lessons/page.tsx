import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { CreateLessonForm } from "@/features/lessons/components/CreateLessonForm";
import { LessonList } from "@/features/lessons/components/LessonList";
import { listLessons } from "@/features/lessons/services/lesson-service";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherLessonsPage() {
  const supabase = await createClient();
  const { data, error } = await listLessons(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/teacher" className="text-sm text-zinc-600 hover:underline">
          ← Về dashboard
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">Bài học</h1>

        <CreateLessonForm />

        <div className="w-full max-w-md">
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách bài học: {error}
            </p>
          ) : (
            <LessonList items={data ?? []} />
          )}
        </div>
      </main>
    </div>
  );
}
