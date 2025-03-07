"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminMoviesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [targetDate, setTargetDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [addingMovie, setAddingMovie] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState<{ id: string, title: string } | null>(null);

    // 박스오피스 영화 데이터 수집 및 저장
    const fetchBoxOfficeMovies = async () => {
        try {
            setLoading(true);
            setError(null);
            setResults(null);
            setAddSuccess(null);

            const dateParam = targetDate ? `?targetDate=${targetDate.replace(/-/g, "")}` : "";
            const response = await fetch(`/api/movies/complete${dateParam}`, {
                method: "POST",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "영화 데이터 수집에 실패했습니다.");
            }

            const data = await response.json();
            setResults(data.results);
        } catch (error) {
            setError(error instanceof Error ? error.message : "영화 데이터 수집 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 박스오피스 영화 데이터 조회 (저장하지 않음)
    const fetchBoxOfficeOnly = async () => {
        try {
            setLoading(true);
            setError(null);
            setResults(null);
            setAddSuccess(null);

            const dateParam = targetDate ? `?targetDate=${targetDate.replace(/-/g, "")}` : "";
            const response = await fetch(`/api/kobis/boxoffice${dateParam}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "박스오피스 데이터 조회에 실패했습니다.");
            }

            const data = await response.json();

            // 결과 형식 변환
            const formattedResults = data.movies.map((movie: any) => ({
                title: movie.movieNm,
                movieCd: movie.movieCd,
                rank: movie.rank,
                openDt: movie.openDt,
                audiCnt: movie.audiCnt,
                audiAcc: movie.audiAcc,
                // 저장하지 않으므로 success 필드는 필요 없음
                type: "조회만 함"
            }));

            setResults(formattedResults);
        } catch (error) {
            setError(error instanceof Error ? error.message : "박스오피스 데이터 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // KMDb 영화 검색
    const searchKMDbMovies = async () => {
        if (!searchQuery.trim()) {
            setError("검색어를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchResults(null);
            setAddSuccess(null);

            console.log(`[AdminMoviesPage] KMDB 검색 시작: "${searchQuery}"`);
            const response = await fetch(`/api/kmdb?query=${encodeURIComponent(searchQuery)}`);
            console.log(`[AdminMoviesPage] KMDB 검색 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "영화 검색에 실패했습니다.");
            }

            const responseText = await response.text();
            console.log(`[AdminMoviesPage] 응답 텍스트 (처음 100자): ${responseText.substring(0, 100)}...`);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error(`[AdminMoviesPage] JSON 파싱 오류:`, e);
                throw new Error("API 응답을 JSON으로 파싱할 수 없습니다.");
            }

            console.log(`[AdminMoviesPage] 검색 결과 수: ${data.results?.length || 0}`);
            setSearchResults(data.results || []);
        } catch (error) {
            console.error(`[AdminMoviesPage] 검색 오류:`, error);
            setError(error instanceof Error ? error.message : "영화 검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // KMDB 영화를 Supabase에 추가
    const addMovieToSupabase = async (kmdbId: string, title: string) => {
        try {
            setAddingMovie(kmdbId);
            setError(null);
            setAddSuccess(null);

            const response = await fetch('/api/movies/add-from-kmdb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kmdbId, title }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "영화 추가에 실패했습니다.");
            }

            setAddSuccess({ id: kmdbId, title });
        } catch (error) {
            setError(error instanceof Error ? error.message : "영화 추가 중 오류가 발생했습니다.");
        } finally {
            setAddingMovie(null);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">영화 데이터 관리</h1>

            <div className="mb-8 p-4 border rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">박스오피스 데이터</h2>
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label htmlFor="targetDate" className="block mb-1">
                            날짜 (YYYY-MM-DD)
                        </label>
                        <input
                            type="date"
                            id="targetDate"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <button
                            onClick={fetchBoxOfficeOnly}
                            disabled={loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                            title="박스오피스 데이터를 조회만 하고 저장하지 않습니다"
                        >
                            {loading ? "처리 중..." : "데이터 조회만"}
                        </button>
                        <button
                            onClick={fetchBoxOfficeMovies}
                            disabled={loading}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                            title="박스오피스 데이터를 가져와서 Supabase에 저장합니다"
                        >
                            {loading ? "처리 중..." : "데이터 수집 및 저장"}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {addSuccess && (
                    <p className="text-green-500 mb-4">
                        영화 "{addSuccess.title}"가 성공적으로 추가되었습니다!
                    </p>
                )}

                {results && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">처리 결과</h3>
                        <div className="max-h-60 overflow-y-auto border rounded p-2 bg-white">
                            <ul className="divide-y">
                                {results.map((result, index) => (
                                    <li key={index} className="py-2">
                                        <span className="font-medium">{result.title}</span>
                                        {result.type === "조회만 함" ? (
                                            <span className="text-blue-500 ml-2">ℹ️ 조회만 함 (순위: {result.rank})</span>
                                        ) : result.success ? (
                                            <span className="text-green-500 ml-2">✓ 저장 성공</span>
                                        ) : (
                                            <span className="text-red-500 ml-2">✗ 저장 실패: {result.error}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-8 p-4 border rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">영화 검색 및 추가 (KMDb)</h2>
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label htmlFor="searchQuery" className="block mb-1">
                            영화 제목
                        </label>
                        <input
                            type="text"
                            id="searchQuery"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={searchKMDbMovies}
                            disabled={loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {loading ? "검색 중..." : "검색"}
                        </button>
                    </div>
                </div>

                {searchResults && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">검색 결과</h3>
                        {searchResults.length === 0 ? (
                            <p>검색 결과가 없습니다.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((movie) => (
                                    <div key={movie.id} className="border rounded p-3 bg-white">
                                        <div className="flex">
                                            {movie.poster && (
                                                <div className="w-24 h-36 mr-3 flex-shrink-0">
                                                    <img
                                                        src={movie.poster}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{movie.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {movie.prodYear} | {movie.director}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {movie.runtime}분 | {movie.genre}
                                                </p>
                                                <p className="text-sm mt-2 line-clamp-3">{movie.plot}</p>

                                                <div className="mt-3">
                                                    <button
                                                        onClick={() => addMovieToSupabase(movie.id, movie.title)}
                                                        disabled={loading || addingMovie === movie.id || addSuccess?.id === movie.id}
                                                        className={`px-3 py-1 text-sm rounded ${addSuccess?.id === movie.id
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400'
                                                            }`}
                                                    >
                                                        {addingMovie === movie.id
                                                            ? "추가 중..."
                                                            : addSuccess?.id === movie.id
                                                                ? "추가 완료"
                                                                : "Supabase에 추가"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => router.push("/")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
} 