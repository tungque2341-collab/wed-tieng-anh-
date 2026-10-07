import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { AddVocabularyForm } from "@/features/vocabulary/components/AddVocabularyForm";
import { VocabularyList } from "@/features/vocabulary/components/VocabularyList";
import { listVocabulary } from "@/features/vocabulary/services/vocabulary-service";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherVocabularyPage() {
  const supabase = await createClient();
  const { data, error } = await listVocabulary(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/teacher" className="text-sm text-zinc-600 hover:underline">
          ← Về dashboard
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">
          Danh sách từ vựng
        </h1>
        <p className="mb-8 max-w-sm text-center text-sm text-zinc-600">
          Tìm kiếm, lọc, sắp xếp sẽ có ở Ngày 11.
        </p>

        <AddVocabularyForm />

        <div className="w-full max-w-2xl">
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách từ vựng: {error}
            </p>
          ) : (
            <VocabularyList items={data ?? []} />
          )}
        </div>
      </main>
    </div>
  );
}
