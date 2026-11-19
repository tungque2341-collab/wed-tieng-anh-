import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { getFallingWordsAction } from "@/features/game/actions";
import { FallingWordsGame } from "@/features/game/components/FallingWordsGame";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentGamePage({ params }: PageProps) {
  const { id } = await params;
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

  // Lấy bài học
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  if (!lesson) {
    notFound();
  }

  // Lấy danh sách từ vựng cho game
  const wordsResult = await getFallingWordsAction(id);
  const words = wordsResult.words ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href={`/student/lessons/${id}`} className="text-sm text-zinc-600 hover:underline">
          ← Về bài học
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <div className="mb-8 w-full max-w-2xl text-center">
          <h1 className="mb-1 text-2xl font-bold text-zinc-900">Game: {lesson.title}</h1>
          {lesson.description && <p className="text-sm text-zinc-600">{lesson.description}</p>}
        </div>

        {/* Tabs navigation */}
        <nav className="mb-6 w-full max-w-2xl flex gap-2" aria-label="Chế độ học tập">
          <Link
            href={`/student/lessons/${id}`}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            📖 Xem từ vựng
          </Link>
          <Link
            href={`/student/lessons/${id}/flashcard`}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            🎴 Flashcard
          </Link>
          <Link
            href={`/student/lessons/${id}/quiz`}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            ❓ Quiz
          </Link>
          <Link
            href={`/student/lessons/${id}/spelling`}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            ✍️ Đánh vần
          </Link>
          <Link
            href={`/student/lessons/${id}/game`}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
            aria-current="page"
          >
            🎮 Game
          </Link>
        </nav>

        <FallingWordsGame words={words} lessonId={id} />
      </main>
    </div>
  );
}