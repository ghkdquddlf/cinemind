export const metadata = {
  title: "마이페이지 - CineMind",
  description: "내 리뷰, 댓글, 즐겨찾기 영화를 관리하세요",
};

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 미들웨어에서 인증 확인을 처리하므로 여기서는 간소화
  return <>{children}</>;
}
