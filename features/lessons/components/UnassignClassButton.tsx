"use client";

import { useActionState } from "react";
import { unassignLessonFromClassAction, type LessonClassState } from "../actions";

const initialState: LessonClassState = { error: null };

export function UnassignClassButton({
  lessonId,
  classId,
  className,
}: {
  lessonId: string;
  classId: string;
  className: string;
}) {
  const [state, formAction, isPending] = useActionState(
    unassignLessonFromClassAction,
    initialState,
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="lesson_id" value={lessonId} />
        <input type="hidden" name="class_id" value={classId} />
        <button
          type="submit"
          disabled={isPending}
          className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Bỏ gán lớp "${className}"`}
        >
          {isPending ? "Đang bỏ..." : "Bỏ gán"}
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
