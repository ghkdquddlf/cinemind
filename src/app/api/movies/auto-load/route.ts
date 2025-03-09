import { NextResponse } from "next/server";
import { getCompleteMovieInfo, getBoxOfficeData } from "@/lib/api";
import { saveMovie } from "@/lib/movies";
import { createClient } from "@/lib/supabase/client";

// 박스오피스 영화 타입 정의
interface BoxOfficeMovie {
  rank: string;
  movieCd: string;
  movieNm: string;
  openDt: string;
  audiCnt: string;
  audiAcc: string;
}

// 마지막 업데이트 시간을 저장하는 메모리 캐시
let lastUpdateTimestamp: number | null = null;
// 캐시 유효 시간 (1시간)
const CACHE_TTL = 60 * 60 * 1000;

// 자동 데이터 로드 전용 API (일별 박스오피스 데이터를 가져와 Supabase에 저장)
export async function GET() {
  try {
    const now = Date.now();
    const supabase = createClient();

    // 마지막 업데이트 시간 확인
    if (lastUpdateTimestamp && now - lastUpdateTimestamp < CACHE_TTL) {
      // 캐시가 유효한 경우 데이터만 반환
      const { data: boxOfficeMovies } = await supabase
        .from("movies")
        .select("movieCd, rank, movieNm, openDt, audiCnt, audiAcc")
        .order("rank", { ascending: true })
        .limit(10);

      if (boxOfficeMovies && boxOfficeMovies.length > 0) {
        return NextResponse.json({
          targetDate: new Date().toISOString().split("T")[0].replace(/-/g, ""),
          movies: boxOfficeMovies,
          fromCache: true,
        });
      }
    }

    // 어제 날짜 사용
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDate = yesterday.toISOString().split("T")[0].replace(/-/g, "");

    // 박스오피스 데이터 가져오기
    const boxOfficeMovies = (await getBoxOfficeData(
      targetDate
    )) as BoxOfficeMovie[];

    // 시스템 설정에서 마지막 업데이트 시간 확인
    const { data: systemSettings } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "last_boxoffice_update")
      .single();

    const lastDbUpdate = systemSettings?.value
      ? new Date(systemSettings.value).getTime()
      : 0;
    const shouldUpdate = !lastDbUpdate || now - lastDbUpdate > CACHE_TTL;

    if (shouldUpdate) {
      // 각 영화의 완전한 정보를 가져와 DB에 저장
      await Promise.all(
        boxOfficeMovies.map(async (movie: BoxOfficeMovie) => {
          try {
            const movieInfo = await getCompleteMovieInfo(
              movie.movieCd,
              movie.movieNm
            );
            await saveMovie(movieInfo);
            return {
              title: movie.movieNm,
              success: true,
            };
          } catch (error) {
            console.error(`영화 처리 실패: ${movie.movieNm}`, error);
            return {
              title: movie.movieNm,
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );

      // 마지막 업데이트 시간 저장
      await supabase.from("system_settings").upsert(
        {
          key: "last_boxoffice_update",
          value: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      // 메모리 캐시 업데이트
      lastUpdateTimestamp = now;

      if (process.env.NODE_ENV === "development") {
        console.log("박스오피스 데이터 업데이트 완료");
      }
    } else if (process.env.NODE_ENV === "development") {
      console.log("최근에 이미 업데이트되어 스킵합니다");
    }

    // 박스오피스 데이터만 반환 (저장 결과는 로그로만 남김)
    return NextResponse.json({
      targetDate,
      movies: boxOfficeMovies.map((movie: BoxOfficeMovie) => ({
        rank: movie.rank,
        movieCd: movie.movieCd,
        movieNm: movie.movieNm,
        openDt: movie.openDt,
        audiCnt: movie.audiCnt,
        audiAcc: movie.audiAcc,
      })),
    });
  } catch (error) {
    console.error("자동 데이터 로드 실패:", error);
    return NextResponse.json(
      { error: "자동 데이터 로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
