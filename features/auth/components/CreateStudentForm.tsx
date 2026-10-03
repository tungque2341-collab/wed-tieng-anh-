"use client";

import { useActionState } from "react";
import { createStudentAccount, type CreateStudentState } from "../actions";

const initialState: CreateStudentState = { error: null, success: null };

export function CreateStudentForm() {
  const [state, formAction, isPending] = useActionState(
    createStudentAccount,
    initialState,
  );

  return (
    <form
      action={formAction}
      key={state.success ?? "form"}
      className="w-full max-w-sm space-y-4"
    >
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-zinc-700"
        >
          Họ tên học sinh
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-zinc-700"
        >
          Tên đăng nhập
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="hs_an"
          pattern="[a-z0-9_]{3,20}"
          title="Chữ thường, số, dấu gạch dưới, 3-20 ký tự"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Chữ thường, số, dấu gạch dưới (_), 3-20 ký tự. Không trùng với tên
          đăng nhập đã có.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-700"
        >
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Ít nhất 6 ký tự. Hãy ghi lại để báo cho học sinh.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-base font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang tạo..." : "Tạo tài khoản"}
      </button>
    </form>
  );
}
