import { NextResponse } from "next/server";
import { getLatestMovies } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { saveMovie } from "@/lib/movies";
import type { Movie } from "@/types/movie";

export async function GET() {
  try {
    const supabase = createClient();

    // 1. 먼저 KOBIS API에서 최신 영화 데이터를 가져옴
    const latestMovies = await getLatestMovies();

    // 2. 가져온 데이터를 Supabase에 저장
    for (const movie of latestMovies) {
      await saveMovie(movie);
    }

    // 3. Supabase에서 전체 영화 목록을 조회
    const { data: movies, error } = await supabase
      .from("movies")
      .select("*")
      .order("release_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ movies });
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
