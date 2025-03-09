import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

// 특정 리뷰에 대한 모든 답글 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const reviewId = params.reviewId;
    console.log("GET 요청 - reviewId:", reviewId);

    const supabase = createClient();

    // 테이블 존재 여부 확인
    try {
      const { error: tableCheckError } = await supabase
        .from("review_replies")
        .select("id")
        .limit(1);

      if (tableCheckError) {
        console.error("테이블 확인 오류:", tableCheckError);
        return NextResponse.json(
          {
            error:
              "review_replies 테이블이 존재하지 않습니다. 테이블을 생성해주세요.",
          },
          { status: 500 }
        );
      }
    } catch (tableError) {
      console.error("테이블 확인 중 예외 발생:", tableError);
    }

    const { data, error } = await supabase
      .from("review_replies")
      .select("*")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching replies:", error);
      return NextResponse.json(
        { error: "답글을 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ replies: data || [] });
  } catch (error) {
    console.error("Error in replies API:", error);
    return NextResponse.json(
      { error: "답글을 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 특정 리뷰에 답글 추가
export async function POST(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const reviewId = params.reviewId;
    const movieId = params.id;
    console.log("POST 요청 - reviewId:", reviewId, "movieId:", movieId);

    const { author, content, user_id } = await request.json();
    console.log("POST 요청 - 데이터:", { author, content, user_id });

    if (!author || !content) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 테이블 존재 여부 확인
    try {
      const { error: tableCheckError } = await supabase
        .from("review_replies")
        .select("id")
        .limit(1);

      if (tableCheckError) {
        console.error("테이블 확인 오류:", tableCheckError);

        // 테이블이 없는 경우 SQL 쿼리 제안
        const createTableSQL = `
CREATE TABLE review_replies (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS review_replies_user_id_idx ON review_replies (user_id);
CREATE INDEX IF NOT EXISTS review_replies_review_id_idx ON review_replies (review_id);`;

        return NextResponse.json(
          {
            error:
              "review_replies 테이블이 존재하지 않습니다. 다음 SQL 쿼리를 실행하여 테이블을 생성해주세요.",
            sql: createTableSQL,
          },
          { status: 500 }
        );
      }
    } catch (tableError) {
      console.error("테이블 확인 중 예외 발생:", tableError);
    }

    // UUID 생성
    const replyId = uuidv4();
    console.log("생성된 replyId:", replyId);

    // 먼저 리뷰가 존재하는지 확인
    const { data: reviewExists, error: reviewCheckError } = await supabase
      .from("reviews")
      .select("id")
      .eq("id", reviewId)
      .single();

    if (reviewCheckError || !reviewExists) {
      console.error("리뷰가 존재하지 않음:", reviewCheckError);
      return NextResponse.json(
        { error: "해당 리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("review_replies")
      .insert([
        {
          id: replyId,
          review_id: reviewId,
          author,
          content,
          user_id,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating reply:", error);
      return NextResponse.json(
        { error: `답글 작성에 실패했습니다: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: data[0] });
  } catch (error) {
    console.error("Error in replies API:", error);
    return NextResponse.json(
      {
        error: `답글 작성에 실패했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`,
      },
      { status: 500 }
    );
  }
}

// 답글 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    // 로그에 매개변수 기록
    console.log("DELETE 요청 - params:", params);
    const movieId = params.id;
    const reviewId = params.reviewId;

    const { replyId } = await request.json();
    console.log(
      "DELETE 요청 - replyId:",
      replyId,
      "movieId:",
      movieId,
      "reviewId:",
      reviewId
    );

    if (!replyId) {
      return NextResponse.json(
        { error: "답글 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 인증 확인 로직 디버깅
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

      // 답글 정보 가져오기
      const { data: reply, error: replyError } = await supabase
        .from("review_replies")
        .select("user_id")
        .eq("id", replyId)
        .single();

      console.log("답글 정보:", {
        reply,
        error: replyError ? replyError.message : null,
      });

      if (replyError) {
        console.error("답글 조회 오류:", replyError);
        return NextResponse.json(
          { error: "답글을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 개발 환경에서는 권한 확인을 건너뛰기 (테스트 목적)
      if (process.env.NODE_ENV !== "development") {
        // 관리자이거나 답글 작성자인 경우에만 삭제 허용
        const isAdmin = user?.email === process.env.ADMIN_EMAIL;
        const isAuthor = user && reply.user_id === user.id;

        if (!isAdmin && !isAuthor) {
          return NextResponse.json(
            { error: "이 답글을 삭제할 권한이 없습니다." },
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

    // 답글 삭제
    const { error: deleteError } = await supabase
      .from("review_replies")
      .delete()
      .eq("id", replyId);

    if (deleteError) {
      console.error("답글 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "답글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "답글이 삭제되었습니다." });
  } catch (error) {
    console.error("답글 삭제 중 오류:", error);
    return NextResponse.json(
      { error: "답글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
