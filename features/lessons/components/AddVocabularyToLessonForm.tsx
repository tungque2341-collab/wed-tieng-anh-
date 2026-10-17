"use client";

import { useActionState } from "react";
import type { Vocabulary } from "@/types/vocabulary";
import {
  addVocabularyToLessonAction,
  type LessonVocabularyState,
} from "../actions";

const initialState: LessonVocabularyState = { error: null };

export function AddVocabularyToLessonForm({
  lessonId,
  availableVocabulary,
}: {
  lessonId: string;
  availableVocabulary: Vocabulary[];
}) {
  const [state, formAction, isPending] = useActionState(
    addVocabularyToLessonAction,
    initialState,
  );

  if (availableVocabulary.length === 0) {
    return (
      <p className="mb-6 text-sm text-zinc-500">
        Không còn từ nào để thêm — tạo thêm từ vựng ở trang{" "}
        <a href="/teacher/vocabulary" className="underline">
          Từ vựng
        </a>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="mb-6 flex items-end gap-2">
      <input type="hidden" name="lesson_id" value={lessonId} />
      <div className="flex-1">
        <label htmlFor="vocabulary_id" className="block text-xs font-medium text-zinc-600">
          Thêm từ vào bài học
        </label>
        <select
          id="vocabulary_id"
          name="vocabulary_id"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {availableVocabulary.map((v) => (
            <option key={v.id} value={v.id}>
              {v.word} — {v.meaning}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang thêm..." : "Thêm"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
