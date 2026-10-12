import Link from "next/link";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { CreateClassForm } from "@/features/classes/components/CreateClassForm";
import { listClasses } from "@/features/classes/services/class-service";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherClassesPage() {
  const supabase = await createClient();
  const { data, error } = await listClasses(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/teacher" className="text-sm text-zinc-600 hover:underline">
          ← Về dashboard
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">Lớp học</h1>

        <CreateClassForm />

        <div className="w-full max-w-md">
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách lớp: {error}
            </p>
          ) : data && data.length > 0 ? (
            <ul className="space-y-2">
              {data.map((cls) => (
                <li key={cls.id}>
                  <Link
                    href={`/teacher/classes/${cls.id}`}
                    className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    {cls.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-zinc-600">Chưa có lớp nào.</p>
              <p className="mt-1 text-sm text-zinc-400">
                Dùng form phía trên để tạo lớp đầu tiên.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
