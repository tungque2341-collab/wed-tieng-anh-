import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { AddVocabularyForm } from "@/features/vocabulary/components/AddVocabularyForm";
import { VocabularyFilters } from "@/features/vocabulary/components/VocabularyFilters";
import { VocabularyList } from "@/features/vocabulary/components/VocabularyList";
import {
  listVocabulary,
  type VocabularySortOption,
} from "@/features/vocabulary/services/vocabulary-service";
import { createClient } from "@/lib/supabase/server";

const SORT_OPTIONS: VocabularySortOption[] = ["newest", "word_asc", "word_desc"];

function parseSortOption(value: string | undefined): VocabularySortOption {
  if (value && (SORT_OPTIONS as string[]).includes(value)) {
    return value as VocabularySortOption;
  }
  return "newest";
}

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function TeacherVocabularyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const sortBy = parseSortOption(params.sort);

  const supabase = await createClient();
  const { data, error } = await listVocabulary(supabase, { search, sortBy });

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
          Import nhiều từ cùng lúc sẽ có ở Ngày 12.
        </p>

        <AddVocabularyForm />

        <VocabularyFilters search={search} sortBy={sortBy} />

        <div className="w-full max-w-2xl">
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách từ vựng: {error}
            </p>
          ) : (
            <VocabularyList items={data ?? []} isFiltered={search !== ""} />
          )}
        </div>
      </main>
    </div>
  );
}
