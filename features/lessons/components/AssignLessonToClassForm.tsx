"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ClassSummary } from "../services/lesson-service";
import { assignLessonToClassAction, type LessonClassState } from "../actions";

const initialState: LessonClassState = { error: null };

export function AssignLessonToClassForm({
  lessonId,
  availableClasses,
}: {
  lessonId: string;
  availableClasses: ClassSummary[];
}) {
  const [state, formAction, isPending] = useActionState(
    assignLessonToClassAction,
    initialState,
  );

  if (availableClasses.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Không còn lớp nào để gán — tạo thêm lớp ở trang{" "}
        <Link href="/teacher/classes" className="underline">
          Lớp học
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="lesson_id" value={lessonId} />
      <div className="flex-1">
        <select
          name="class_id"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {availableClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang gán..." : "Gán"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
