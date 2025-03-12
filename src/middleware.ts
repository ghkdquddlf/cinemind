import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

// 관리자 이메일 목록
const ADMIN_EMAILS = ["admin@example.com", "admin@test.com"];

// 관리자 경로와 마이페이지 경로 정의
const ADMIN_PATHS = ["/admin"];
const MYPAGE_PATHS = ["/mypage"];
const PUBLIC_ADMIN_PATHS = ["/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase 클라이언트 생성
  const { supabase, response } = createClient(request);

  // 세션 확인 (모든 경로에 대해 먼저 확인)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 마이페이지 경로인지 확인
  const isMyPagePath = MYPAGE_PATHS.some((path) => pathname.startsWith(path));

  // 마이페이지 접근 시 인증 확인
  if (isMyPagePath) {
    if (!session) {
      const url = new URL("/auth/login?redirect=/mypage", request.url);
      return NextResponse.redirect(url);
    }

    // 세션이 있으면 계속 진행
    return response;
  }

  // 관리자 경로인지 확인
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // 관리자 경로가 아니거나 공개 관리자 경로라면 미들웨어 건너뛰기
  if (!isAdminPath || isPublicAdminPath) {
    return response;
  }

  // 로그인하지 않은 경우
  if (!session) {
    const url = new URL(`/auth/login?redirect=${pathname}`, request.url);
    return NextResponse.redirect(url);
  }

  // 관리자 이메일 확인
  const userEmail = session.user.email;

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    // 관리자가 아닌 경우 홈으로 리디렉션
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // 관리자 인증 성공
  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // 관리자 경로와 마이페이지 경로에 대해 미들웨어 실행
    "/admin/:path*",
    "/mypage/:path*",
    "/mypage",
  ],
};
