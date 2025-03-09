import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

// 리뷰 삭제 API
export async function DELETE(request: Request) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: "리뷰 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 인증 확인 로직 디버깅
    console.log("리뷰 삭제 요청 - reviewId:", reviewId);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("인증 상태:", {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError ? authError.message : null,
      });

      if (authError) {
        console.error("인증 오류:", authError);
        // 개발 환경에서는 인증 오류를 무시하고 진행 (테스트 목적)
        if (process.env.NODE_ENV === "development") {
          console.log("개발 환경에서는 인증 오류를 무시하고 진행합니다.");
        } else {
          return NextResponse.json(
            { error: "인증 오류가 발생했습니다." },
            { status: 500 }
          );
        }
      }

      // 리뷰 정보 가져오기
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();

      console.log("리뷰 정보:", {
        review,
        error: reviewError ? reviewError.message : null,
      });

      if (reviewError) {
        console.error("리뷰 조회 오류:", reviewError);
        return NextResponse.json(
          { error: "리뷰를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 개발 환경에서는 권한 확인을 건너뛰기 (테스트 목적)
      if (process.env.NODE_ENV !== "development") {
        // 관리자이거나 리뷰 작성자인 경우에만 삭제 허용
        const isAdmin = user?.email === process.env.ADMIN_EMAIL;
        const isAuthor = user && review.user_id === user.id;

        if (!isAdmin && !isAuthor) {
          return NextResponse.json(
            { error: "이 리뷰를 삭제할 권한이 없습니다." },
            { status: 403 }
          );
        }
      }
    } catch (authCheckError) {
      console.error("인증 확인 중 오류:", authCheckError);
      // 개발 환경에서는 오류를 무시하고 진행
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "인증 확인 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    // 리뷰에 달린 답글 먼저 삭제
    try {
      const { error: repliesDeleteError } = await supabase
        .from("review_replies")
        .delete()
        .eq("review_id", reviewId);

      if (repliesDeleteError) {
        console.error("답글 삭제 오류:", repliesDeleteError);
      }
    } catch (repliesError) {
      console.error("답글 삭제 중 오류:", repliesError);
      // 답글 삭제 실패는 무시하고 계속 진행
    }

    // 리뷰 삭제
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error("리뷰 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "리뷰 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("리뷰 삭제 중 오류:", error);
    return NextResponse.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
