import { UserStatus } from "@/features/auth/components/UserStatus";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex justify-end px-6 py-4">
        <UserStatus />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          Học Tiếng Anh Cùng Cô Giáo Trinh
        </h1>
        <p className="mt-4 max-w-md text-base text-zinc-600 sm:text-lg">
          Website đang được xây dựng. Chức năng từ vựng, bài học, flashcard,
          quiz... sẽ lần lượt xuất hiện ở đây.
        </p>
      </main>
    </div>
  );
}
