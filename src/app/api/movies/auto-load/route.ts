import { NextResponse } from "next/server";
import { getCompleteMovieInfo, getBoxOfficeData } from "@/lib/api";
import { saveMovie } from "@/lib/movies";

// 자동 데이터 로드 전용 API (일별 박스오피스 데이터를 가져와 Supabase에 저장)
export async function GET(request: Request) {
    try {
        // 어제 날짜 사용
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const targetDate = yesterday.toISOString().split("T")[0].replace(/-/g, "");

        // 박스오피스 데이터 가져오기
        const boxOfficeMovies = await getBoxOfficeData(targetDate);

        // 각 영화의 완전한 정보를 가져와 DB에 저장
        const results = await Promise.all(
            boxOfficeMovies.map(async (movie: any) => {
                try {
                    const movieInfo = await getCompleteMovieInfo(movie.movieCd, movie.movieNm);
                    const saveResult = await saveMovie(movieInfo);
                    return {
                        title: movie.movieNm,
                        success: !saveResult.error,
                        error: saveResult.error ? String(saveResult.error) : null,
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

        // 박스오피스 데이터만 반환 (저장 결과는 로그로만 남김)
        return NextResponse.json({
            targetDate,
            movies: boxOfficeMovies.map((movie: any) => ({
                rank: movie.rank,
                movieCd: movie.movieCd,
                movieNm: movie.movieNm,
                openDt: movie.openDt,
                audiCnt: movie.audiCnt,
                audiAcc: movie.audiAcc
            }))
        });
    } catch (error) {
        console.error("자동 데이터 로드 실패:", error);
        return NextResponse.json(
            { error: "자동 데이터 로드에 실패했습니다." },
            { status: 500 }
        );
    }
} 