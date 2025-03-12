"use client";

import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 관리자 이메일 목록
const ADMIN_EMAILS = ["admin@example.com", "admin@test.com"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // 현재 경로에 따라 활성 탭 결정
  const isMoviesActive = pathname === "/admin/movies";
  const isMovieListActive = pathname === "/admin/movie-list";
  const isUsersActive = pathname === "/admin/users";
  const isReviewsActive = pathname === "/admin/reviews";

  // 탭 스타일 함수
  const getTabStyle = (isActive: boolean) => {
    return isActive
      ? "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      : "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600";
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          redirect("/auth/login?redirect=/admin/movies");
          return;
        }

        // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
        if (!data.session) {
          redirect("/auth/login?redirect=/admin/movies");
          return;
        }

        // 관리자 이메일 확인
        const email = data.session.user.email || null;

        if (!email || !ADMIN_EMAILS.includes(email)) {
          redirect("/");
          return;
        }

        setIsLoading(false);
      } catch {
        redirect("/auth/login?redirect=/admin/movies");
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">관리자 페이지</h1>
        <div className="flex gap-4 mb-6">
          <a href="/admin/movies" className={getTabStyle(isMoviesActive)}>
            영화 추가
          </a>
          <a
            href="/admin/movie-list"
            className={getTabStyle(isMovieListActive)}
          >
            영화 목록
          </a>
          <a href="/admin/users" className={getTabStyle(isUsersActive)}>
            사용자 관리
          </a>
          <a href="/admin/reviews" className={getTabStyle(isReviewsActive)}>
            리뷰 관리
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}
