import { NextResponse } from "next/server";
import { searchKMDbMovies } from "@/lib/api";
import { saveMovie } from "@/lib/movies";
import type { Movie } from "@/types/movie";

export async function POST(request: Request) {
    try {
        const { kmdbId, title } = await request.json();

        if (!kmdbId || !title) {
            return NextResponse.json(
                { error: "KMDB ID와 영화 제목이 필요합니다." },
                { status: 400 }
            );
        }

        // KMDB에서 영화 검색
        const searchResults = await searchKMDbMovies(title);

        // 해당 ID의 영화 찾기
        const movieData = searchResults.find(movie => movie.DOCID === kmdbId);

        if (!movieData) {
            return NextResponse.json(
                { error: "해당 ID의 영화를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        // 제목에서 !HS, !HE 같은 태그 제거
        let cleanTitle = movieData.title || "";
        cleanTitle = cleanTitle.replace(/!HS|!HE/g, "").trim();

        // 포스터 URL 처리
        let posterUrl = undefined;

        // 직접 API 응답 구조 확인
        const allKeys = Object.keys(movieData);
        const posterKeys = allKeys.filter(key => key.toLowerCase().includes('poster'));

        // 모든 가능한 포스터 필드 확인
        for (const key of posterKeys) {
            const value = movieData[key];
            if (value && typeof value === 'string' && value.trim()) {
                // URL 처리 시도
                let url = value.trim();

                // 파이프로 구분된 경우 첫 번째 URL 사용
                if (url.includes('|')) {
                    const urls = url.split('|').filter((u: string) => u.trim());
                    if (urls.length > 0) {
                        url = urls[0].trim();
                    } else {
                        continue; // 유효한 URL이 없으면 다음 필드로
                    }
                }

                // URL에 프로토콜 추가
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `https://${url}`;
                }

                // URL 유효성 검사
                try {
                    new URL(url);
                    posterUrl = url;
                    break; // 유효한 URL을 찾았으므로 반복 중단
                } catch (e) {
                    // 유효하지 않은 URL은 무시
                }
            }
        }

        // 줄거리 처리
        let plotText = "";
        if (movieData.plot) {
            // plot 필드가 직접 문자열로 제공되는 경우
            plotText = movieData.plot;
        } else if (movieData.plots?.plot?.[0]?.plotText) {
            // plots.plot[].plotText 구조로 제공되는 경우
            plotText = movieData.plots.plot[0].plotText;
        }

        // 영화 데이터 구성
        const movie: Movie = {
            id: kmdbId, // KMDB ID를 영화 ID로 사용
            title: cleanTitle,
            original_title: movieData.titleEng || undefined,
            release_date: movieData.repRlsDate || movieData.prodYear || "",
            genres: movieData.genre ? movieData.genre.split(',').map((g: string) => g.trim()) : [],
            runtime: parseInt(movieData.runtime) || undefined,
            vote_count: undefined, // 관객수 정보 없음
            created_at: new Date().toISOString(),
            poster_path: posterUrl,
            description: plotText
        };

        // Supabase에 저장 (중복 검사 로직이 saveMovie 함수 내에 추가됨)
        const result = await saveMovie(movie);

        if (result.error) {
            return NextResponse.json(
                { error: `영화 저장 실패: ${result.error}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `영화 "${movie.title}" 추가 완료`,
            movie: result.data?.[0]
        });
    } catch (error) {
        console.error("영화 추가 중 오류 발생:", error);
        return NextResponse.json(
            { error: "영화 추가 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
} 