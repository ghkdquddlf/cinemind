"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types/movie";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// 추천 영화 스켈레톤 컴포넌트
const MovieCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 shadow">
      <div className="relative h-40 mb-2">
        <Skeleton height="100%" />
      </div>
      <Skeleton height={24} width="80%" className="mb-1" />
      <Skeleton height={16} width="60%" />
    </div>
  );
};

// 장르 버튼 스켈레톤 컴포넌트
const GenreButtonsSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex gap-2 min-w-max">
        <Skeleton height={40} width={80} count={8} inline />
      </div>
    </div>
  );
};

export function RandomMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/movies", {
        next: { revalidate: 3600 },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "영화 데이터를 가져오는데 실패했습니다.");
      }

      setAllMovies(data.movies);

      const allGenres = new Set<string>();
      data.movies.forEach((movie: Movie) => {
        movie.genres?.forEach((genre) => allGenres.add(genre));
      });
      setGenres(Array.from(allGenres));

      const shuffledMovies = [...data.movies].sort(() => Math.random() - 0.5);
      setMovies(shuffledMovies.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleGenreChange = useCallback(
    (genre: string) => {
      setSelectedGenre(genre);
      setLoading(true);

      try {
        let filteredMovies = allMovies;
        if (genre !== "all") {
          filteredMovies = allMovies.filter((movie: Movie) =>
            movie.genres?.includes(genre)
          );
        }

        const shuffledMovies = [...filteredMovies].sort(
          () => Math.random() - 0.5
        );
        setMovies(shuffledMovies.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [allMovies]
  );

  const scrollGenres = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollRef.current.scrollLeft;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const genreButtons = useMemo(() => {
    return (
      <div className="relative w-full">
        <button
          onClick={() => scrollGenres("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-1 shadow-md hover:bg-opacity-100"
          aria-label="왼쪽으로 스크롤"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="w-full overflow-x-auto py-2 px-8 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => handleGenreChange("all")}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedGenre === "all"
                  ? "bg-blue-500 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedGenre === genre
                    ? "bg-blue-500 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => scrollGenres("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-1 shadow-md hover:bg-opacity-100"
          aria-label="오른쪽으로 스크롤"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }, [genres, selectedGenre, handleGenreChange]);

  if (loading && movies.length === 0) {
    return (
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">장르별 영화</h2>
          <GenreButtonsSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <MovieCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">장르별 영화</h2>
        {genreButtons}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="relative h-40 mb-2 flex-shrink-0">
                  <Image
                    src={movie.poster_path || "/default-movie-image.jpg"}
                    alt={movie.title || "영화 포스터"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                    {movie.title}
                  </h3>
                  {movie.genres && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      장르: {movie.genres.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            해당 장르의 영화가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
