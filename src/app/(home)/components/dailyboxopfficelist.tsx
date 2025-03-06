// src/app/(home)/components/MovieList.tsx
"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { MovieItem } from "./dailyboxofficeitem";
import { createClient } from "@/lib/supabase/client";

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

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const supabase = createClient();

  const fetchMoviePosters = async (movies: Movie[]) => {
    const moviePromises = movies.map(async (movie) => {
      // Supabase에서 영화 정보 조회
      const { data } = await supabase
        .from("movies")
        .select("poster_path")
        .eq("id", movie.movieCd)
        .single();

      return {
        ...movie,
        poster_path: data?.poster_path || "/default-movie-image.jpg",
      };
    });

    return Promise.all(moviePromises);
  };

  useEffect(() => {
    async function fetchMovies() {
      try {
        // KOBIS API에서 영화 정보 가져오기
        const res = await fetch("/api/kobis");
        const kobisData = await res.json();

        // Supabase에서 포스터 정보 가져오기
        const moviesWithPosters = await fetchMoviePosters(kobisData);
        setMovies(moviesWithPosters);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    }
    fetchMovies();
  }, []);

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
