"use client";

import { useActionState } from "react";
import { createQuizAction } from "../actions";

type Props = {
  lessonId: string;
};

export function CreateQuizForm({ lessonId }: Props) {
  const [state, action] = useActionState(createQuizAction, {
    error: null,
    quizId: null,
  });

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="lesson_id" value={lessonId} />
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
          Tiêu đề Quiz
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          placeholder="Ví dụ: Kiểm tra bài 1 - Từ vựng cơ bản"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
      >
        Tạo Quiz
      </button>
      {state.quizId && (
        <p className="text-sm text-green-600 text-center">
          Đã tạo quiz! <a href={`/teacher/quiz/${state.quizId}/questions`} className="underline">Quản lý câu hỏi →</a>
        </p>
      )}
    </form>
  );
}