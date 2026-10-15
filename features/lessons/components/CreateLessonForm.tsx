"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLessonAction, type CreateLessonState } from "../actions";

const initialState: CreateLessonState = { error: null, success: false };

export function CreateLessonForm() {
  const [state, formAction, isPending] = useActionState(
    createLessonAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Dependency là CẢ object `state` (không chỉ state.success) để chạy
  // đúng mỗi lần, kể cả tạo liên tiếp nhiều bài học đều thành công.
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 w-full max-w-md rounded-lg border border-zinc-200 bg-white p-4"
    >
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Tạo bài học mới
      </h2>

      <div className="mb-3">
        <label htmlFor="title" className="block text-xs font-medium text-zinc-600">
          Tiêu đề (bắt buộc)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Bài 1: Trái cây"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-zinc-600">
          Mô tả (tùy chọn)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang tạo..." : "Tạo bài học"}
      </button>
    </form>
  );
}
