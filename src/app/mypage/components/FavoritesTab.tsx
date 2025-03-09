"use client";

import Image from "next/image";
import Link from "next/link";
import { FavoriteItem } from "../types";
import { MovieSkeleton } from "./Skeletons";

interface FavoritesTabProps {
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  onRemoveFavorite: (movieId: string) => void;
}

export default function FavoritesTab({
  favorites,
  loading,
  error,
  onRemoveFavorite,
}: FavoritesTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">즐겨찾기</h2>
      {loading ? (
        // 영화 로딩 스켈레톤
        <>
          <MovieSkeleton />
          <MovieSkeleton />
          <MovieSkeleton />
        </>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-500">즐겨찾기한 영화가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="border rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-20 h-28 relative">
                  <Image
                    src={
                      favorite.movies?.poster_path || "/default-movie-image.jpg"
                    }
                    alt={favorite.movies?.title || "영화 포스터"}
                    fill
                    sizes="(max-width: 768px) 80px, 120px"
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">
                      <Link
                        href={`/movies/${favorite.movie_id}`}
                        className="hover:underline"
                      >
                        {favorite.movies?.title || "제목 없음"}
                      </Link>
                    </h3>
                    <button
                      onClick={() => onRemoveFavorite(favorite.movie_id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {favorite.movies?.release_date &&
                      new Date(favorite.movies.release_date).getFullYear()}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                    {favorite.movies?.description || "줄거리 정보가 없습니다."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
