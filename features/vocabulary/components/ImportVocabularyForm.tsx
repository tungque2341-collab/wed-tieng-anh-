"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { importVocabularyAction, type ImportVocabularyState } from "../actions";

const initialState: ImportVocabularyState = {
  error: null,
  success: false,
  importedCount: 0,
};

export function ImportVocabularyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    importVocabularyAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Nhập thành công -> xóa trắng textarea. Phải dùng useEffect (không
  // đọc ref.current trong lúc render — React cấm việc này), và dependency
  // là CẢ object `state` để chạy đúng mỗi lần action hoàn thành, kể cả
  // khi nhập liên tiếp nhiều lần đều thành công.
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-4 text-sm text-zinc-600 underline hover:text-zinc-900"
      >
        Nhập nhiều từ cùng lúc
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">
          Nhập nhiều từ cùng lúc
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-zinc-500 hover:underline"
        >
          Thu gọn
        </button>
      </div>

      <p className="mb-2 text-xs text-zinc-500">
        Mỗi dòng 1 từ, các phần ngăn cách bởi dấu <code>|</code>, theo thứ tự:{" "}
        <code>từ | nghĩa | phiên âm | ví dụ</code> (phiên âm và ví dụ không bắt
        buộc). Ví dụ:
      </p>
      <pre className="mb-3 whitespace-pre-wrap rounded-md bg-zinc-100 p-2 text-xs text-zinc-600">
        apple | quả táo | /ˈæp.əl/ | I eat an apple every day.{"\n"}book | quyển
        sách
      </pre>

      <textarea
        name="bulk"
        rows={6}
        required
        placeholder="apple | quả táo | /ˈæp.əl/ | I eat an apple every day."
        className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm focus:border-zinc-500 focus:outline-none"
      />

      {state.error && (
        <p role="alert" className="mt-3 whitespace-pre-wrap text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 text-sm text-green-600">
          Đã thêm {state.importedCount} từ.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang nhập..." : "Nhập danh sách"}
      </button>
    </form>
  );
}
