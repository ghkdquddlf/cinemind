import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const metadata = {
  title: "관리자 페이지 - CineMind",
  description: "영화 관리 및 사이트 관리를 위한 관리자 페이지",
};

// 관리자 이메일 목록 (실제로는 환경 변수나 데이터베이스에서 관리하는 것이 좋습니다)
const ADMIN_EMAILS = ["admin@example.com"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  if (!data.session) {
    redirect("/auth/login?redirect=/admin");
  }

  // 관리자가 아닌 사용자는 홈으로 리디렉션
  const userEmail = data.session.user.email;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">관리자 페이지</h1>
        <div className="flex gap-4 mb-6">
          <a
            href="/admin/movies"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            영화 관리
          </a>
          <a
            href="/admin/users"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            사용자 관리
          </a>
          <a
            href="/admin/reviews"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            리뷰 관리
          </a>
          <a
            href="/"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            홈으로
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}
