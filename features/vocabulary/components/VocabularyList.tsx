import type { Vocabulary } from "@/types/vocabulary";
import { VocabularyRow } from "./VocabularyRow";

export function VocabularyList({ items }: { items: Vocabulary[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Chưa có từ vựng nào.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Dùng form phía trên để thêm từ đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-600">
          <tr>
            <th className="px-4 py-2 font-medium">Từ</th>
            <th className="px-4 py-2 font-medium">Phiên âm</th>
            <th className="px-4 py-2 font-medium">Nghĩa</th>
            <th className="px-4 py-2 font-medium">Ví dụ</th>
            <th className="px-4 py-2 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <VocabularyRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
