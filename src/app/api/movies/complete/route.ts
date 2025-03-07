import { NextResponse } from "next/server";
import { getCompleteMovieInfo, getBoxOfficeData } from "@/lib/api";
import { saveMovie } from "@/lib/movies";

// 단일 영화의 완전한 정보를 가져오는 API
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const movieCd = searchParams.get("movieCd");
    const title = searchParams.get("title");

    if (!movieCd || !title) {
        return NextResponse.json(
            { error: "영화 코드(movieCd)와 제목(title)이 필요합니다." },
            { status: 400 }
        );
    }

    try {
        console.log(`[GET /api/movies/complete] 영화 정보 요청: ${title} (${movieCd})`);
        const movieInfo = await getCompleteMovieInfo(movieCd, title);

        console.log(`[GET /api/movies/complete] 영화 정보 응답:`, {
            title: movieInfo.title,
            poster_path: movieInfo.poster_path || '없음',
            description: movieInfo.description ? '있음' : '없음'
        });

        return NextResponse.json({ movie: movieInfo });
    } catch (error) {
        console.error("영화 정보 요청 실패:", error);
        return NextResponse.json(
            { error: "영화 정보를 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
}

// 박스오피스 영화들의 완전한 정보를 가져와 DB에 저장하는 API
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get("targetDate") || undefined;

    try {
        console.log(`[POST /api/movies/complete] 박스오피스 데이터 요청 - 날짜: ${targetDate || '어제'}`);

        // 박스오피스 데이터 가져오기
        const boxOfficeMovies = await getBoxOfficeData(targetDate);
        console.log(`[POST /api/movies/complete] 박스오피스 영화 ${boxOfficeMovies.length}개 가져옴`);

        // 각 영화의 완전한 정보를 가져와 DB에 저장
        const results = await Promise.all(
            boxOfficeMovies.map(async (movie: any) => {
                try {
                    console.log(`[POST /api/movies/complete] 영화 정보 처리 중: ${movie.movieNm}`);
                    const movieInfo = await getCompleteMovieInfo(movie.movieCd, movie.movieNm);
                    const saveResult = await saveMovie(movieInfo);
                    return {
                        title: movie.movieNm,
                        success: !saveResult.error,
                        error: saveResult.error ? String(saveResult.error) : null,
                    };
                } catch (error) {
                    console.error(`[POST /api/movies/complete] 영화 처리 실패: ${movie.movieNm}`, error);
                    return {
                        title: movie.movieNm,
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                    };
                }
            })
        );

        const successCount = results.filter(r => r.success).length;
        console.log(`[POST /api/movies/complete] 처리 완료: ${successCount}/${boxOfficeMovies.length}개 성공`);

        return NextResponse.json({
            message: `${boxOfficeMovies.length}개 영화 중 ${successCount}개 처리 완료`,
            results
        });
    } catch (error) {
        console.error("박스오피스 영화 정보 처리 실패:", error);
        return NextResponse.json(
            { error: "영화 정보 처리에 실패했습니다." },
            { status: 500 }
        );
    }
} 