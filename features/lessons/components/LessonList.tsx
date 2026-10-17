import Link from "next/link";
import type { Lesson } from "../services/lesson-service";

export function LessonList({ items }: { items: Lesson[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
        <p className="text-zinc-600">Chưa có bài học nào.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Dùng form phía trên để tạo bài học đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((lesson) => (
        <li key={lesson.id}>
          <Link
            href={`/teacher/lessons/${lesson.id}`}
            className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300 hover:bg-zinc-50"
          >
            <p className="text-sm font-medium text-zinc-900">{lesson.title}</p>
            {lesson.description && (
              <p className="mt-1 text-sm text-zinc-500">{lesson.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
