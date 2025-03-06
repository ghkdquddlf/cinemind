"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types/movie";

export function RandomMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/movies");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "영화 데이터를 가져오는데 실패했습니다.");
      }

      // 모든 장르 추출
      const allGenres = new Set<string>();
      data.movies.forEach((movie: Movie) => {
        movie.genres?.forEach((genre) => allGenres.add(genre));
      });
      setGenres(Array.from(allGenres));

      // 영화 목록 섞기
      const shuffledMovies = [...data.movies].sort(() => Math.random() - 0.5);
      setMovies(shuffledMovies.slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = async (genre: string) => {
    setSelectedGenre(genre);
    try {
      setLoading(true);
      const response = await fetch("/api/movies");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "영화 데이터를 가져오는데 실패했습니다.");
      }

      let filteredMovies = data.movies;
      if (genre !== "all") {
        filteredMovies = data.movies.filter((movie: Movie) =>
          movie.genres?.includes(genre)
        );
      }

      // 필터링된 영화 중 랜덤으로 6개 선택
      const shuffledMovies = [...filteredMovies].sort(
        () => Math.random() - 0.5
      );
      setMovies(shuffledMovies.slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">로딩 중...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">추천 영화</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleGenreChange("all")}
            className={`px-3 py-1 rounded ${
              selectedGenre === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            전체
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreChange(genre)}
              className={`px-3 py-1 rounded ${
                selectedGenre === genre
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
              <Image
                src={movie.poster_path || "/default-movie-image.jpg"}
                alt="영화 포스터"
                width={128}
                height={128}
                className="object-cover mb-2"
              />
              <h3 className="text-lg font-semibold mb-1">{movie.title}</h3>
              {movie.genres && (
                <p className="text-sm text-gray-600">
                  장르: {movie.genres.join(", ")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
