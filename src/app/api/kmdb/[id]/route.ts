import { NextResponse } from "next/server";
import { getKMDbMovieDetail } from "@/lib/api";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const movieId = params.id;

        if (!movieId) {
            return NextResponse.json(
                { error: "영화 ID가 필요합니다." },
                { status: 400 }
            );
        }

        const movieDetail = await getKMDbMovieDetail(movieId);

        // 필요한 정보만 추출하여 반환
        const formattedDetail = {
            id: movieDetail.DOCID,
            title: movieDetail.title,
            titleEng: movieDetail.titleEng,
            titleOrg: movieDetail.titleOrg,
            releaseDate: movieDetail.repRlsDate,
            prodYear: movieDetail.prodYear,
            directors: movieDetail.directors?.director?.map((d: any) => d.directorNm) || [],
            actors: movieDetail.actors?.actor?.map((a: any) => ({
                name: a.actorNm,
                role: a.actorRole,
            })) || [],
            runtime: movieDetail.runtime,
            rating: movieDetail.rating,
            genre: movieDetail.genre,
            plots: movieDetail.plots?.plot?.map((p: any) => p.plotText) || [],
            posters: movieDetail.posters ? movieDetail.posters.split("|") : [],
            stills: movieDetail.stlls ? movieDetail.stlls.split("|") : [],
        };

        return NextResponse.json({ movie: formattedDetail });
    } catch (error) {
        console.error("KMDb 영화 상세 정보 요청 실패:", error);
        return NextResponse.json(
            { error: "영화 상세 정보를 가져오는데 실패했습니다." },
            { status: 500 }
        );
    }
} 