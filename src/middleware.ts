import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 관리자 API 엔드포인트는 제외 (인증에 필요하기 때문)
const ADMIN_PATHS = ["/admin"];
const EXCLUDED_PATHS = ["/api/admin/auth", "/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 미들웨어 처리에서 제외
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 관리자 경로인지 확인
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isExcludedPath = EXCLUDED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // 관리자 경로가 아니거나 제외된 경로라면 미들웨어 건너뛰기
  if (!isAdminPath || isExcludedPath) {
    return NextResponse.next();
  }

  // 쿠키에서 관리자 인증 토큰 확인
  const adminToken = request.cookies.get("admin_token")?.value;

  // 토큰이 없으면 로그인 페이지로 리디렉션
  if (!adminToken) {
    // 관리자 로그인 페이지로 리디렉션
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }

  // 토큰이 있으면 계속 진행
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // 관리자 경로에 대해서만 미들웨어 실행
    "/admin/:path*",
  ],
};
