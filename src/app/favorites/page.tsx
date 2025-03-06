"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFavorites } from "@/lib/favorites";
import type { Movie } from "@/types/movie";

export default function FavoritesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const favoriteMovies = await getFavorites();
      setMovies(favoriteMovies);
    } catch (error) {
      setError(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">즐겨찾기 목록</h1>
      {movies.length === 0 ? (
        <p className="text-gray-500">즐겨찾기한 영화가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                <Image
                  src={movie.poster_path || "/default-movie-image.jpg"}
                  alt={movie.title}
                  width={300}
                  height={450}
                  className="w-full object-cover mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
                {movie.original_title && (
                  <p className="text-gray-600 mb-2">{movie.original_title}</p>
                )}
                <p className="text-gray-700">개봉일: {movie.release_date}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
