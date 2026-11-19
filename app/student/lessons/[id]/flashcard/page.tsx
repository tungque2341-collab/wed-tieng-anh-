import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { listFlashcardsForLesson } from "@/features/flashcard/services/flashcard-service";
import { FlashcardViewer } from "@/features/flashcard/components/FlashcardViewer";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentFlashcardPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Lấy user hiện tại (học sinh)
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

  // Lấy bài học + flashcard kèm tiến độ
  const flashcardResult = await listFlashcardsForLesson(supabase, id, user.id);

  // Lấy thông tin bài học để hiển thị tiêu đề
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  if (!lesson) {
    notFound();
  }

  const flashcards = flashcardResult.data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href={`/student/lessons/${id}`} className="text-sm text-zinc-600 hover:underline">
          ← Về bài học
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="mb-8 w-full max-w-md text-center">
          <h1 className="mb-1 text-2xl font-bold text-zinc-900">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm text-zinc-600">{lesson.description}</p>
          )}
        </div>

        <FlashcardViewer flashcards={flashcards} lessonId={id} />
      </main>
    </div>
  );
}