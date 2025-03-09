// src/app/(home)/components/MovieList.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { MovieItem } from "./dailyboxofficeitem";
import { createClient } from "@/lib/supabase/client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 스켈레톤 영화 아이템 컴포넌트
const MovieItemSkeleton = () => {
  return (
    <div className="p-4 h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[2/3] w-full">
          <Skeleton height="100%" />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <Skeleton width="80%" height={24} className="mb-2" />
          <Skeleton width="60%" height={20} className="mb-2" />
          <Skeleton width="40%" height={16} />
          <div className="mt-auto pt-4">
            <Skeleton width="100%" height={36} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface Movie {
  movieCd: string;
  rank: string;
  movieNm: string;
  openDt: string;
  audiCnt: string;
  salesAmt: string;
  poster_path?: string;
}

// 박스오피스 데이터 캐싱을 위한 객체
interface BoxOfficeCache {
  data: Movie[];
  timestamp: number;
  posters: Record<string, string>;
}

// 메모리 캐시 (세션 간에는 유지되지 않음)
let boxOfficeCache: BoxOfficeCache | null = null;
// 캐시 유효 시간 (1시간)
const CACHE_TTL = 60 * 60 * 1000;

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // 메모이제이션된 함수로 변경
  const fetchMoviePosters = useCallback(
    async (movies: Movie[]) => {
      try {
        // 캐시된 포스터 정보 확인
        const cachedPosters = boxOfficeCache?.posters || {};
        const moviesToFetch = movies.filter(
          (movie) => !cachedPosters[movie.movieCd]
        );

        if (moviesToFetch.length === 0) {
          // 모든 포스터 정보가 캐시에 있는 경우
          return movies.map((movie) => ({
            ...movie,
            poster_path:
              cachedPosters[movie.movieCd] || "/default-movie-image.jpg",
          }));
        }

        // 병렬 처리를 위한 배치 처리 (한 번에 5개씩 처리)
        const batchSize = 5;
        const newPosters: Record<string, string> = {};

        for (let i = 0; i < moviesToFetch.length; i += batchSize) {
          const batch = moviesToFetch.slice(i, i + batchSize);
          const batchPromises = batch.map(async (movie) => {
            try {
              // Supabase에서 영화 정보 조회
              const { data } = await supabase
                .from("movies")
                .select("poster_path")
                .eq("id", movie.movieCd)
                .single();

              const posterPath =
                data?.poster_path || "/default-movie-image.jpg";
              newPosters[movie.movieCd] = posterPath;
              return {
                ...movie,
                poster_path: posterPath,
              };
            } catch (err) {
              console.error(`포스터 정보 조회 실패 (${movie.movieNm}):`, err);
              newPosters[movie.movieCd] = "/default-movie-image.jpg";
              return {
                ...movie,
                poster_path: "/default-movie-image.jpg",
              };
            }
          });

          await Promise.all(batchPromises);
        }

        // 캐시 업데이트
        if (boxOfficeCache) {
          boxOfficeCache.posters = { ...boxOfficeCache.posters, ...newPosters };
        }

        // 모든 영화에 포스터 정보 적용
        return movies.map((movie) => ({
          ...movie,
          poster_path:
            newPosters[movie.movieCd] ||
            cachedPosters[movie.movieCd] ||
            "/default-movie-image.jpg",
        }));
      } catch (err) {
        console.error("포스터 정보 조회 중 오류:", err);
        return movies.map((movie) => ({
          ...movie,
          poster_path: "/default-movie-image.jpg",
        }));
      }
    },
    [supabase]
  );

  // 메모이제이션된 함수로 변경
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 캐시 확인
      const now = Date.now();
      if (boxOfficeCache && now - boxOfficeCache.timestamp < CACHE_TTL) {
        setMovies(boxOfficeCache.data);
        setLoading(false);
        return;
      }

      // 데이터만 가져오는 API 호출
      const res = await fetch("/api/kobis", {
        next: { revalidate: 3600 }, // 1시간마다 재검증
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch movies:", errorText);
        setError("영화 데이터를 가져오는데 실패했습니다.");
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("JSON 파싱 오류:", err);
        setError("데이터 형식이 올바르지 않습니다.");
        return;
      }

      if (!data || !data.movies || !Array.isArray(data.movies)) {
        console.error("Invalid data format:", data);
        setError("데이터 형식이 올바르지 않습니다.");
        return;
      }

      const kobisData = data.movies;

      // Supabase에서 포스터 정보 가져오기
      const moviesWithPosters = await fetchMoviePosters(kobisData);

      // 캐시 업데이트
      boxOfficeCache = {
        data: moviesWithPosters,
        timestamp: now,
        posters: moviesWithPosters.reduce((acc, movie) => {
          if (movie.poster_path) {
            acc[movie.movieCd] = movie.poster_path;
          }
          return acc;
        }, {} as Record<string, string>),
      };

      setMovies(moviesWithPosters);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("영화 데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [fetchMoviePosters]);

  useEffect(() => {
    fetchMovies();

    // 컴포넌트 언마운트 시 캐시 정리 (선택적)
    return () => {
      // 캐시 유지를 위해 정리하지 않음
    };
  }, [fetchMovies]);

  // 오류 발생 시 표시
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchMovies}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 로딩 상태일 때 스켈레톤 UI 표시
  if (loading && movies.length === 0) {
    return (
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="mySwiper"
        >
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <SwiperSlide key={`skeleton-${index}`}>
                <MovieItemSkeleton />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    );
  }

  // 영화가 없는 경우
  if (movies.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>표시할 영화가 없습니다.</p>
        <button
          onClick={fetchMovies}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className="mySwiper"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.movieCd}>
            <div className="p-4">
              <MovieItem movie={movie} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
