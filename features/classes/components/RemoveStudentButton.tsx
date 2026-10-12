"use client";

import { useActionState } from "react";
import {
  removeStudentFromClassAction,
  type ClassMembershipState,
} from "../actions";

const initialState: ClassMembershipState = { error: null };

export function RemoveStudentButton({
  classId,
  studentId,
  studentName,
}: {
  classId: string;
  studentId: string;
  studentName: string;
}) {
  const [state, formAction, isPending] = useActionState(
    removeStudentFromClassAction,
    initialState,
  );

  return (
    <div>
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!confirm(`Bỏ "${studentName}" khỏi lớp này?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="class_id" value={classId} />
        <input type="hidden" name="student_id" value={studentId} />
        <button
          type="submit"
          disabled={isPending}
          className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Đang xóa..." : "Bỏ khỏi lớp"}
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
