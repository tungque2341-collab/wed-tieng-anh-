import Link from "next/link";
import { notFound } from "next/navigation";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { AddStudentToClassForm } from "@/features/classes/components/AddStudentToClassForm";
import { RemoveStudentButton } from "@/features/classes/components/RemoveStudentButton";
import {
  getClassById,
  listMyStudents,
  listStudentsInClass,
} from "@/features/classes/services/class-service";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [classResult, inClassResult] = await Promise.all([
    getClassById(supabase, id),
    listStudentsInClass(supabase, id),
  ]);

  if (classResult.error || !classResult.data) {
    notFound();
  }

  const inClass = inClassResult.data ?? [];

  // Danh sách học sinh "chưa trong lớp này" = toàn bộ học sinh giáo viên
  // đã tạo, trừ những em đã có trong `inClass`.
  const myStudentsResult = user
    ? await listMyStudents(supabase, user.id)
    : { data: [], error: null };
  const inClassIds = new Set(inClass.map((s) => s.id));
  const available = (myStudentsResult.data ?? []).filter(
    (s) => !inClassIds.has(s.id),
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/teacher/classes" className="text-sm text-zinc-600 hover:underline">
          ← Về danh sách lớp
        </Link>
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          Lớp {classResult.data.name}
        </h1>

        <div className="w-full max-w-md">
          <AddStudentToClassForm classId={id} availableStudents={available} />

          {inClassResult.error ? (
            <p role="alert" className="text-sm text-red-600">
              Không tải được danh sách học sinh: {inClassResult.error}
            </p>
          ) : inClass.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-zinc-600">Lớp này chưa có học sinh nào.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
              {inClass.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-zinc-900">
                    {student.full_name}{" "}
                    <span className="text-zinc-400">({student.username})</span>
                  </span>
                  <RemoveStudentButton
                    classId={id}
                    studentId={student.id}
                    studentName={student.full_name}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
