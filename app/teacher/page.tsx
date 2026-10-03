import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";

export default function TeacherHome() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex justify-end px-6 py-4">
        <UserStatus />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          Dashboard giáo viên
        </h1>
        <p className="mt-2 text-zinc-600">
          Trang này sẽ có quản lý lớp, từ vựng, bài học, quiz, thống kê...
          (xây đầy đủ ở Ngày 28).
        </p>
        <Link
          href="/teacher/students"
          className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Tạo tài khoản học sinh
        </Link>
      </main>
    </div>
  );
}
