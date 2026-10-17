"use client";

import { useActionState } from "react";
import {
  removeVocabularyFromLessonAction,
  type LessonVocabularyState,
} from "../actions";

const initialState: LessonVocabularyState = { error: null };

export function RemoveVocabularyFromLessonButton({
  lessonId,
  vocabularyId,
  word,
}: {
  lessonId: string;
  vocabularyId: string;
  word: string;
}) {
  const [state, formAction, isPending] = useActionState(
    removeVocabularyFromLessonAction,
    initialState,
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="lesson_id" value={lessonId} />
        <input type="hidden" name="vocabulary_id" value={vocabularyId} />
        <button
          type="submit"
          disabled={isPending}
          className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Bỏ từ "${word}" khỏi bài học`}
        >
          {isPending ? "Đang xóa..." : "Bỏ"}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
