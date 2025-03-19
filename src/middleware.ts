import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

// 환경 변수에서 관리자 이메일 목록 가져오기
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

const ADMIN_PATHS = ["/admin"];
const MYPAGE_PATHS = ["/mypage"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, response } = createClient(request);

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 페이지 접근 권한 확인
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isMyPagePath = MYPAGE_PATHS.some((path) => pathname.startsWith(path));

  // 관리자 페이지 접근 검증
  if (isAdminPath) {
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 마이페이지 접근 검증
  if (isMyPagePath) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ["/admin/:path*", "/mypage"],
};
