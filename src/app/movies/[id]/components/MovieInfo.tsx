"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { Movie } from "@/types/movie";

interface MovieInfoProps {
  movie: Movie;
  favorite: boolean;
  loading: boolean;
  onToggleFavorite: () => void;
}

export default function MovieInfo({
  movie,
  favorite,
  loading,
  onToggleFavorite,
}: MovieInfoProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 포스터 이미지 */}
        <div className="w-full md:w-1/3">
          {isClient ? (
            <Image
              src={movie.poster_path || "/default-movie-image.jpg"}
              alt="영화 포스터"
              width={500}
              height={750}
              className="w-full rounded-lg shadow-lg"
              priority
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-lg"></div>
          )}
        </div>

        {/* 영화 정보 */}
        <div className="w-full md:w-2/3">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold">{movie.title}</h1>
            <button
              onClick={onToggleFavorite}
              disabled={loading}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${favorite
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
            >
              <span className="text-xl">{favorite ? "★" : "☆"}</span>
              {loading ? "처리 중..." : favorite ? "즐겨찾기 해제" : "즐겨찾기"}
            </button>
          </div>

          {movie.original_title && (
            <p className="text-2xl text-gray-600 mb-6">
              {movie.original_title}
            </p>
          )}

          <div className="space-y-4 text-lg">
            <p className="text-gray-700">
              <span className="font-semibold">개봉일:</span>{" "}
              {movie.release_date}
            </p>
            {movie.runtime && (
              <p className="text-gray-700">
                <span className="font-semibold">상영시간:</span> {movie.runtime}
                분
              </p>
            )}
            {movie.genres && (
              <p className="text-gray-700">
                <span className="font-semibold">장르:</span>{" "}
                {movie.genres.join(", ")}
              </p>
            )}
            {movie.vote_count && (
              <p className="text-gray-700">
                <span className="font-semibold">누적 관객:</span>{" "}
                {movie.vote_count.toLocaleString()}명
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 줄거리 섹션 */}
      {(movie.description || movie.overview) && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">줄거리</h2>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {movie.description || movie.overview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
