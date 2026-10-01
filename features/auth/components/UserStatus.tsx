import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";

export async function UserStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-zinc-700 hover:underline"
      >
        Đăng nhập
      </Link>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const roleLabel = profile?.role === "teacher" ? "Giáo viên" : "Học sinh";

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-700">
        Xin chào,{" "}
        <span className="font-medium">{profile?.full_name ?? "bạn"}</span>{" "}
        <span className="text-zinc-400">({roleLabel})</span>
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}
