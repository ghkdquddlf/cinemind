import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // 환경 변수에서 관리자 비밀번호 가져오기
    // 실제 환경에서는 .env.local 파일에 ADMIN_PASSWORD를 설정해야 합니다
    const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

    if (password === adminPassword) {
      // 쿠키 설정 (보안을 위해 httpOnly, secure 옵션 사용)
      // 실제 환경에서는 더 복잡한 토큰 생성 로직을 사용해야 합니다
      const cookieStore = cookies();
      cookieStore.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24시간
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { success: false, message: "인증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // 쿠키 삭제
    const cookieStore = cookies();
    cookieStore.delete("admin_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { success: false, message: "로그아웃 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
