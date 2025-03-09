import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "마이페이지 - CineMind",
  description: "내 리뷰, 댓글, 즐겨찾기 영화를 관리하세요",
};

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  if (!data.session) {
    redirect("/auth/login?redirect=/mypage");
  }

  return <>{children}</>;
}
