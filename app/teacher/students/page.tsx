import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { CreateStudentForm } from "@/features/auth/components/CreateStudentForm";

export default function TeacherStudentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/teacher" className="text-sm text-zinc-600 hover:underline">
          ← Về dashboard
        </Link>
        <UserStatus />
      </header>
      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">
          Tạo tài khoản học sinh
        </h1>
        <p className="mb-8 max-w-sm text-center text-sm text-zinc-600">
          Học sinh đăng nhập bằng tên đăng nhập này (không cần email).
          Việc gán học sinh vào lớp sẽ làm ở Ngày 13.
        </p>
        <CreateStudentForm />
      </main>
    </div>
  );
}
