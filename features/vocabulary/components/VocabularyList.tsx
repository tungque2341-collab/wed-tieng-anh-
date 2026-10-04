import type { Vocabulary } from "@/types/vocabulary";

export function VocabularyList({ items }: { items: Vocabulary[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Chưa có từ vựng nào.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Chức năng thêm từ vựng sẽ có ở Ngày 9.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-600">
          <tr>
            <th className="px-4 py-2 font-medium">Từ</th>
            <th className="px-4 py-2 font-medium">Phiên âm</th>
            <th className="px-4 py-2 font-medium">Nghĩa</th>
            <th className="px-4 py-2 font-medium">Ví dụ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-zinc-200">
              <td className="px-4 py-2 font-medium text-zinc-900">
                {item.word}
              </td>
              <td className="px-4 py-2 text-zinc-500">
                {item.phonetic ?? "—"}
              </td>
              <td className="px-4 py-2 text-zinc-700">{item.meaning}</td>
              <td className="px-4 py-2 text-zinc-500">
                {item.example ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
