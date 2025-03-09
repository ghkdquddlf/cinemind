"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const logout = async () => {
      try {
        // Supabase 로그아웃
        await supabase.auth.signOut();

        // 로컬 스토리지에서 관리자 인증 정보 삭제
        localStorage.removeItem("adminAuthenticated");

        // 홈으로 리디렉션
        router.push("/");
      } catch (error) {
        console.error("로그아웃 중 오류 발생:", error);
        // 오류가 발생해도 홈으로 리디렉션
        router.push("/");
      }
    };

    logout();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">로그아웃 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
