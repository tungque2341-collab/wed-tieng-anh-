import Link from "next/link";
import { notFound } from "next/navigation";
import { UserStatus } from "@/features/auth/components/UserStatus";
import {
  getLessonById,
  listVocabularyInLesson,
} from "@/features/lessons/services/lesson-service";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentLessonPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS (Ngày 2) tự chặn: nếu bài học này chưa gán cho lớp của học sinh,
  // getLessonById trả về null (không phải lỗi) -> notFound() bên dưới.
  const [lessonResult, vocabResult] = await Promise.all([
    getLessonById(supabase, id),
    listVocabularyInLesson(supabase, id),
  ]);

  if (lessonResult.error || !lessonResult.data) {
    notFound();
  }

  const words = vocabResult.data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/student/lessons" className="text-sm text-zinc-600 hover:underline">
          ← Về danh sách bài học
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">
          {lessonResult.data.title}
        </h1>
        {lessonResult.data.description && (
          <p className="mb-6 max-w-md text-center text-sm text-zinc-600">
            {lessonResult.data.description}
          </p>
        )}
        {!lessonResult.data.description && <div className="mb-6" />}

        <div className="w-full max-w-md">
          {vocabResult.error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được từ vựng: {vocabResult.error}
            </p>
          ) : words.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-zinc-600">Bài học này chưa có từ vựng nào.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {words.map((word) => (
                <li
                  key={word.id}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-zinc-900">
                      {word.word}
                    </span>
                    {word.phonetic && (
                      <span className="text-sm text-zinc-400">
                        {word.phonetic}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-700">{word.meaning}</p>
                  {word.example && (
                    <p className="mt-1 text-sm italic text-zinc-500">
                      {word.example}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
