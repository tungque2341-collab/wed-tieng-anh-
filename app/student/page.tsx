import { UserStatus } from "@/features/auth/components/UserStatus";

export default function StudentHome() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex justify-end px-6 py-4">
        <UserStatus />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          Dashboard học sinh
        </h1>
        <p className="mt-2 text-zinc-600">
          Trang này sẽ có bài học, flashcard, quiz... (xây đầy đủ ở Ngày 27).
        </p>
      </main>
    </div>
  );
}
