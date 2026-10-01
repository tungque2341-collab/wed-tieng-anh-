"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "../actions";

const initialState: SignInState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signIn,
    initialState,
  );

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div>
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-zinc-700"
        >
          Tên đăng nhập (học sinh) hoặc email (giáo viên)
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          placeholder="hs_an hoặc cotrinh@gmail.com"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
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
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-base font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
