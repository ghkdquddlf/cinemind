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

interface Movie {
  movieCd: string;
  rank: string;
  movieNm: string;
  openDt: string;
  audiCnt: string;
  salesAmt: string;
  poster_path?: string;
}

const MovieSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] flex flex-col">
    <div className="relative h-[400px]">
      <Skeleton height="100%" />
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <Skeleton height={28} className="mb-2" />
      <div className="space-y-1 mt-auto">
        <Skeleton height={20} width="60%" />
        <Skeleton height={20} width="40%" />
      </div>
    </div>
  </div>
);

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchMoviePosters = useCallback(
    async (movies: Movie[]) => {
      const moviesWithPosters = [];

      for (const movie of movies) {
        try {
          const { data } = await supabase
            .from("movies")
            .select("poster_path")
            .eq("id", movie.movieCd)
            .single();

          moviesWithPosters.push({
            ...movie,
            poster_path: data?.poster_path || "/default-movie-image.jpg",
          });
        } catch {
          moviesWithPosters.push({
            ...movie,
            poster_path: "/default-movie-image.jpg",
          });
        }
      }

      return moviesWithPosters;
    },
    [supabase]
  );

  const fetchMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/kobis", {
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error("영화 데이터를 가져오는데 실패했습니다.");
      }

      const data = await res.json();
      const moviesWithPosters = await fetchMoviePosters(data.movies);
      setMovies(moviesWithPosters);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "영화 데이터를 가져오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchMoviePosters]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

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

  if (isLoading) {
    return (
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mySwiper"
        >
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <SwiperSlide key={`skeleton-${index}`}>
                <div className="p-4">
                  <MovieSkeleton />
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
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
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
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
