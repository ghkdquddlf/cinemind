import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;
    const supabase = createClient();

    // movie_id 컬럼 이름을 정확하게 지정
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "리뷰를 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error("Error in reviews API:", error);
    return NextResponse.json(
      { error: "리뷰를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;
    const { author, content, password } = await request.json();

    if (!author || !content || !password) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          movie_id: movieId,
          author,
          content,
          password,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json(
        { error: "리뷰 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ review: data[0] });
  } catch (error) {
    console.error("Error in reviews API:", error);
    return NextResponse.json(
      { error: "리뷰 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { reviewId, password } = await request.json();

    if (!reviewId || !password) {
      return NextResponse.json(
        { error: "리뷰 ID와 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 먼저 비밀번호 확인
    const { data: review, error: checkError } = await supabase
      .from("reviews")
      .select("password")
      .eq("id", reviewId)
      .single();

    if (checkError || !review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (review.password !== password) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    // 리뷰 삭제
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error("Error deleting review:", deleteError);
      return NextResponse.json(
        { error: "리뷰 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("Error in delete review API:", error);
    return NextResponse.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
