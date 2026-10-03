import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Chạy trước mỗi request (trừ file tĩnh):
 * 1. Làm mới session đăng nhập (đúng mẫu @supabase/ssr khuyến nghị).
 * 2. Chặn /student/* và /teacher/* nếu chưa đăng nhập hoặc sai vai trò.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isStudentRoute = pathname.startsWith("/student");
  const isTeacherRoute = pathname.startsWith("/teacher");

  if (!isStudentRoute && !isTeacherRoute) {
    return supabaseResponse;
  }

  // Chưa đăng nhập mà vào khu vực riêng -> đẩy về trang đăng nhập
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Sai vai trò (học sinh vào khu giáo viên hoặc ngược lại) -> đẩy về trang chủ
  if (isTeacherRoute && profile?.role !== "teacher") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  if (isStudentRoute && profile?.role !== "student") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
