"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { StudentProfile } from "../services/class-service";
import { addStudentToClassAction, type ClassMembershipState } from "../actions";

const initialState: ClassMembershipState = { error: null };

export function AddStudentToClassForm({
  classId,
  availableStudents,
}: {
  classId: string;
  availableStudents: StudentProfile[];
}) {
  const [state, formAction, isPending] = useActionState(
    addStudentToClassAction,
    initialState,
  );

  if (availableStudents.length === 0) {
    return (
      <p className="mb-6 text-sm text-zinc-500">
        Không còn học sinh nào để thêm — tạo thêm tài khoản học sinh ở trang{" "}
        <Link href="/teacher/students" className="underline">
          Tạo tài khoản học sinh
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="mb-6 flex items-end gap-2">
      <input type="hidden" name="class_id" value={classId} />
      <div className="flex-1">
        <label htmlFor="student_id" className="block text-xs font-medium text-zinc-600">
          Thêm học sinh vào lớp
        </label>
        <select
          id="student_id"
          name="student_id"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {availableStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.username})
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
