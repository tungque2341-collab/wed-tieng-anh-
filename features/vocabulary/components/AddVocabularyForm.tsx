"use client";

import { useActionState, useEffect, useRef } from "react";
import { createVocabularyAction, type CreateVocabularyState } from "../actions";

const initialState: CreateVocabularyState = { error: null, success: false };

export function AddVocabularyForm() {
  const [state, formAction, isPending] = useActionState(
    createVocabularyAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Thêm thành công -> xóa trắng form để gõ từ tiếp theo luôn
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-4"
    >
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Thêm từ vựng mới
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="word" className="block text-xs font-medium text-zinc-600">
            Từ (bắt buộc)
          </label>
          <input
            id="word"
            name="word"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="meaning" className="block text-xs font-medium text-zinc-600">
            Nghĩa (bắt buộc)
          </label>
          <input
            id="meaning"
            name="meaning"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phonetic" className="block text-xs font-medium text-zinc-600">
            Phiên âm (tùy chọn)
          </label>
          <input
            id="phonetic"
            name="phonetic"
            type="text"
            placeholder="/ˈæp.əl/"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="example" className="block text-xs font-medium text-zinc-600">
            Câu ví dụ (tùy chọn)
          </label>
          <input
            id="example"
            name="example"
            type="text"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 text-sm text-green-600">Đã thêm từ vựng.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang thêm..." : "Thêm từ vựng"}
      </button>
    </form>
  );
}
