export function VocabularyFilters({
  search,
  sortBy,
}: {
  search: string;
  sortBy: string;
}) {
  const hasFilter = search !== "" || sortBy !== "newest";

  return (
    <form
      method="get"
      className="mb-4 flex w-full max-w-2xl flex-wrap items-center gap-2"
    >
      <input
        type="text"
        name="q"
        defaultValue={search}
        placeholder="Tìm theo từ hoặc nghĩa..."
        className="min-w-[180px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
      />

      <select
        name="sort"
        defaultValue={sortBy}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        <option value="newest">Mới nhất</option>
        <option value="word_asc">Từ A → Z</option>
        <option value="word_desc">Từ Z → A</option>
      </select>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Lọc
      </button>

      {hasFilter && (
        <a
          href="/teacher/vocabulary"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Xóa bộ lọc
        </a>
      )}
    </form>
  );
}
