import { NextResponse } from "next/server";
import { searchKMDbMovies } from "@/lib/api";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json(
            { error: "검색어(query)가 필요합니다." },
            { status: 400 }
        );
    }

    try {
        console.log(`[GET /api/kmdb] 영화 검색 요청: "${query}"`);
        const results = await searchKMDbMovies(query);

        console.log(`[GET /api/kmdb] 검색 결과 수: ${results.length}`);

        if (results.length === 0) {
            return NextResponse.json(
                { message: "검색 결과가 없습니다.", results: [] },
                { status: 200 }
            );
        }

        // 첫 번째 결과 로깅
        if (results.length > 0) {
            console.log(`[GET /api/kmdb] 첫 번째 결과:`, {
                id: results[0].id,
                title: results[0].title,
                poster: results[0].poster ? '있음' : '없음'
            });
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error("KMDb API 요청 실패:", error);
        return NextResponse.json(
            { error: "영화 검색 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
} 