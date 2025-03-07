import { NextResponse } from "next/server";
import { getBoxOfficeData } from "@/lib/api";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get("targetDate") || undefined;

    try {
        console.log(`[GET /api/kobis/boxoffice] 박스오피스 데이터 요청 - 날짜: ${targetDate || '어제'}`);

        // 박스오피스 데이터 가져오기 (저장하지 않음)
        const boxOfficeMovies = await getBoxOfficeData(targetDate);
        console.log(`[GET /api/kobis/boxoffice] 박스오피스 영화 ${boxOfficeMovies.length}개 가져옴`);

        // 필요한 정보만 추출하여 반환
        const formattedMovies = boxOfficeMovies.map((movie: any) => ({
            rank: movie.rank,
            movieCd: movie.movieCd,
            movieNm: movie.movieNm,
            openDt: movie.openDt,
            audiCnt: movie.audiCnt,
            audiAcc: movie.audiAcc,
            salesAmt: movie.salesAmt,
            salesAcc: movie.salesAcc
        }));

        return NextResponse.json({
            targetDate: targetDate || new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0].replace(/-/g, ''),
            movies: formattedMovies
        });
    } catch (error) {
        console.error("박스오피스 데이터 요청 실패:", error);
        return NextResponse.json(
            { error: "박스오피스 데이터를 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
} 