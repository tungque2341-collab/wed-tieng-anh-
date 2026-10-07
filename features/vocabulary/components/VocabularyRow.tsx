"use client";

import { useActionState, useState } from "react";
import type { Vocabulary } from "@/types/vocabulary";
import {
  deleteVocabularyAction,
  updateVocabularyAction,
  type DeleteVocabularyState,
  type UpdateVocabularyState,
} from "../actions";

const updateInitialState: UpdateVocabularyState = { error: null, success: false };
const deleteInitialState: DeleteVocabularyState = { error: null };

export function VocabularyRow({ item }: { item: Vocabulary }) {
  const [isEditing, setIsEditing] = useState(false);

  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateVocabularyAction,
    updateInitialState,
  );
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteVocabularyAction,
    deleteInitialState,
  );

  // Sửa thành công -> tự đóng chế độ sửa (quay về xem bình thường).
  // Theo đúng mẫu "adjusting state during render" của React: so sánh
  // với giá trị LẦN TRƯỚC (lưu trong state) để chỉ xử lý đúng 1 lần
  // cho mỗi lần sửa — không dùng useEffect (updateState là object mới
  // mỗi lần action chạy xong, nên nếu check trực tiếp mà không so sánh
  // "trước/sau" thì sẽ bị kẹt, không mở lại chế độ sửa được sau lần đầu).
  const [prevUpdateState, setPrevUpdateState] = useState(updateState);
  if (updateState !== prevUpdateState) {
    setPrevUpdateState(updateState);
    if (updateState.success) {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="border-t border-zinc-200 bg-zinc-50">
        <td colSpan={5} className="px-4 py-3">
          <form action={updateFormAction} className="grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="id" value={item.id} />

            <div>
              <label className="block text-xs font-medium text-zinc-600">Từ</label>
              <input
                name="word"
                type="text"
                defaultValue={item.word}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600">Nghĩa</label>
              <input
                name="meaning"
                type="text"
                defaultValue={item.meaning}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600">Phiên âm</label>
              <input
                name="phonetic"
                type="text"
                defaultValue={item.phonetic ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600">Ví dụ</label>
              <input
                name="example"
                type="text"
                defaultValue={item.example ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>

            {updateState.error && (
              <p role="alert" className="text-sm text-red-600 sm:col-span-2">
                {updateState.error}
              </p>
            )}

            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Hủy
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-zinc-200">
      <td className="px-4 py-2 font-medium text-zinc-900">{item.word}</td>
      <td className="px-4 py-2 text-zinc-500">{item.phonetic ?? "—"}</td>
      <td className="px-4 py-2 text-zinc-700">{item.meaning}</td>
      <td className="px-4 py-2 text-zinc-500">{item.example ?? "—"}</td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm text-zinc-600 hover:underline"
          >
            Sửa
          </button>
          <form
            action={deleteFormAction}
            onSubmit={(e) => {
              if (!confirm(`Xóa từ "${item.word}"? Không thể hoàn tác.`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={isDeleting}
              className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </form>
        </div>
        {deleteState.error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {deleteState.error}
          </p>
        )}
      </td>
    </tr>
  );
}
