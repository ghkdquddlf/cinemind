import { NextResponse } from "next/server";
import { getLatestMovies } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { saveMovie } from "@/lib/movies";
import type { Movie } from "@/types/movie";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const supabase = createClient();

    // 먼저 총 개수를 가져옵니다
    let countQuery = supabase.from("movies").select("id", { count: "exact" });

    // 검색어가 있으면 제목으로 검색
    if (searchQuery) {
      countQuery = countQuery.ilike("title", `%${searchQuery}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // 실제 데이터를 가져옵니다
    let dataQuery = supabase.from("movies").select("*");

    // 검색어가 있으면 제목으로 검색
    if (searchQuery) {
      dataQuery = dataQuery.ilike("title", `%${searchQuery}%`);
    }

    // 최신순으로 정렬하고 페이지네이션 적용
    const { data: movies, error } = await dataQuery
      .order("release_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      movies,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in movies API:", error);
    return NextResponse.json(
      { error: "영화 데이터를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log("Starting POST /api/movies");
    // KOBIS API에서 최신 영화 데이터 가져오기
    const movies = await getLatestMovies();
    console.log("Fetched movies from KOBIS:", movies.length);

    if (!movies || movies.length === 0) {
      throw new Error("영화 데이터를 가져오는데 실패했습니다.");
    }

    // 각 영화를 Supabase에 저장
    console.log("Saving movies to Supabase...");
    const results = await Promise.all(
      movies.map((movie: Movie) => saveMovie(movie))
    );
    const errors = results.filter((result: { error: unknown }) => result.error);

    if (errors.length > 0) {
      console.error("Failed to save some movies:", errors);
      return NextResponse.json(
        { error: "일부 영화 저장에 실패했습니다.", details: errors },
        { status: 500 }
      );
    }

    console.log("Successfully saved all movies");
    return NextResponse.json({
      message: `${movies.length}개의 영화가 성공적으로 저장되었습니다.`,
      count: movies.length,
    });
  } catch (error) {
    console.error("Error in POST /api/movies:", error);
    return NextResponse.json(
      {
        error: "영화 저장에 실패했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
