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

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환하는 함수
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 오늘 이미 데이터를 저장했는지 확인하는 함수
  const shouldSaveDataToday = () => {
    if (typeof window === 'undefined') return false;

    const lastSavedDate = localStorage.getItem('lastMovieDataSaveDate');
    const todayDate = getTodayDateString();

    return lastSavedDate !== todayDate;
  };

  // 오늘 날짜를 저장 날짜로 기록하는 함수
  const markDataSavedToday = () => {
    if (typeof window === 'undefined') return;

    const todayDate = getTodayDateString();
    localStorage.setItem('lastMovieDataSaveDate', todayDate);
  };

  useEffect(() => {
    async function fetchMovies() {
      try {
        let kobisData;

        // 오늘 이미 저장했는지 확인
        if (shouldSaveDataToday()) {
          // 자동 데이터 로드 API 호출 (데이터를 Supabase에 저장하고 박스오피스 정보 반환)
          const res = await fetch("/api/movies/auto-load");

          if (!res.ok) {
            console.error("Failed to load movies:", await res.text());
            return;
          }

          const data = await res.json();
          kobisData = data.movies;

          // 저장 날짜 기록
          markDataSavedToday();
        } else {
          // 데이터만 가져오는 API 호출
          const res = await fetch("/api/kobis");

          if (!res.ok) {
            console.error("Failed to fetch movies:", await res.text());
            return;
          }

          const data = await res.json();
          kobisData = data.movies;
        }

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
