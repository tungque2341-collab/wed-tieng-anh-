import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">Đăng nhập</h1>
      <LoginForm />
    </div>
  );
}
