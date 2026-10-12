"use client";

import { useActionState, useEffect, useRef } from "react";
import { createClassAction, type CreateClassState } from "../actions";

const initialState: CreateClassState = { error: null, success: false };

export function CreateClassForm() {
  const [state, formAction, isPending] = useActionState(
    createClassAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Tạo thành công -> xóa trắng form. Dependency là CẢ object `state`
  // (không chỉ state.success) để chạy đúng mỗi lần, kể cả tạo liên tiếp
  // nhiều lớp đều thành công (xem ghi chú tương tự ở AddVocabularyForm).
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 flex w-full max-w-md items-end gap-2"
    >
      <div className="flex-1">
        <label htmlFor="name" className="block text-xs font-medium text-zinc-600">
          Tên lớp
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Lớp 5A"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang tạo..." : "Tạo lớp"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
