"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types/movie";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 영화 카드 스켈레톤 컴포넌트
const MovieCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 shadow">
      <div className="relative h-48 mb-3">
        <Skeleton height="100%" />
      </div>
      <Skeleton height={24} width="80%" className="mb-1" />
      <Skeleton height={16} width="60%" className="mb-1" />
      <Skeleton height={16} width="40%" className="mb-1" />
      <Skeleton height={16} width="50%" />
    </div>
  );
};

export function AllMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 8, // 한 페이지에 8개만 표시
    totalPages: 0,
  });

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 })); // 검색 시 첫 페이지로 이동
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 영화 데이터 가져오기
  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (debouncedQuery) {
          queryParams.append("search", debouncedQuery);
        }

        const response = await fetch(`/api/movies?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error("영화 데이터를 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        setMovies(data.movies || []);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "영화를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [debouncedQuery, pagination.page, pagination.limit]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">전체 영화 목록</h2>
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="영화 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <MovieCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 my-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((movie: Movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`}>
                <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="relative h-48 mb-3 flex-shrink-0">
                    <Image
                      src={movie.poster_path || "/default-movie-image.jpg"}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover rounded"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2QOQvhAAAAABJRU5ErkJggg=="
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                      {movie.title}
                    </h3>
                    {movie.original_title &&
                      movie.original_title !== movie.title && (
                        <p className="text-gray-600 mb-2 line-clamp-1">
                          {movie.original_title}
                        </p>
                      )}
                    <p className="text-gray-700 mb-1">
                      개봉일: {movie.release_date}
                    </p>
                    {movie.genres && (
                      <p className="text-gray-700 mb-1 line-clamp-1">
                        장르: {movie.genres.join(", ")}
                      </p>
                    )}
                    {movie.runtime && (
                      <p className="text-gray-700 mb-1">
                        상영시간: {movie.runtime}분
                      </p>
                    )}
                    {movie.vote_count && (
                      <p className="text-gray-700">
                        누적 관객: {movie.vote_count.toLocaleString()}명
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {movies.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              {debouncedQuery
                ? `"${debouncedQuery}"에 대한 검색 결과가 없습니다.`
                : "저장된 영화가 없습니다."}
            </p>
          )}

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border mr-2 disabled:opacity-50"
                >
                  이전
                </button>

                <div className="flex space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      // 현재 페이지를 중심으로 표시할 페이지 번호 계산
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            pagination.page === pageNum
                              ? "bg-blue-500 text-white"
                              : "border hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded border ml-2 disabled:opacity-50"
                >
                  다음
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
