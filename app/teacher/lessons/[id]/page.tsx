import Link from "next/link";
import { notFound } from "next/navigation";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { AddVocabularyToLessonForm } from "@/features/lessons/components/AddVocabularyToLessonForm";
import { AssignLessonToClassForm } from "@/features/lessons/components/AssignLessonToClassForm";
import { RemoveVocabularyFromLessonButton } from "@/features/lessons/components/RemoveVocabularyFromLessonButton";
import { UnassignClassButton } from "@/features/lessons/components/UnassignClassButton";
import {
  getLessonById,
  listClassesForLesson,
  listVocabularyInLesson,
} from "@/features/lessons/services/lesson-service";
import { listClasses } from "@/features/classes/services/class-service";
import { listVocabulary } from "@/features/vocabulary/services/vocabulary-service";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [lessonResult, inLessonResult, allVocabResult, assignedClassesResult, allClassesResult] =
    await Promise.all([
      getLessonById(supabase, id),
      listVocabularyInLesson(supabase, id),
      listVocabulary(supabase),
      listClassesForLesson(supabase, id),
      listClasses(supabase),
    ]);

  if (lessonResult.error || !lessonResult.data) {
    notFound();
  }

  const inLesson = inLessonResult.data ?? [];

  // Từ vựng "chưa có trong bài học này" = toàn bộ từ vựng của giáo
  // viên, trừ những từ đã gán vào bài học.
  const inLessonIds = new Set(inLesson.map((v) => v.id));
  const available = (allVocabResult.data ?? []).filter(
    (v) => !inLessonIds.has(v.id),
  );

  const assignedClasses = assignedClassesResult.data ?? [];
  const assignedClassIds = new Set(assignedClasses.map((c) => c.id));
  const availableClasses = (allClassesResult.data ?? []).filter(
    (c) => !assignedClassIds.has(c.id),
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/teacher/lessons" className="text-sm text-zinc-600 hover:underline">
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

        <div className="mb-8 w-full max-w-md rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">
            Gán cho lớp
          </h2>

          <AssignLessonToClassForm lessonId={id} availableClasses={availableClasses} />

          {assignedClasses.length > 0 && (
            <ul className="mt-3 space-y-1">
              {assignedClasses.map((cls) => (
                <li
                  key={cls.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-700">{cls.name}</span>
                  <UnassignClassButton
                    lessonId={id}
                    classId={cls.id}
                    className={cls.name}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full max-w-md">
          <AddVocabularyToLessonForm lessonId={id} availableVocabulary={available} />

          {inLessonResult.error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách từ vựng: {inLessonResult.error}
            </p>
          ) : inLesson.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-zinc-600">Bài học này chưa có từ vựng nào.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
              {inLesson.map((vocab) => (
                <li
                  key={vocab.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-zinc-900">
                    {vocab.word}{" "}
                    <span className="text-zinc-400">— {vocab.meaning}</span>
                  </span>
                  <RemoveVocabularyFromLessonButton
                    lessonId={id}
                    vocabularyId={vocab.id}
                    word={vocab.word}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
