"use client";

import { SearchResult, AddSuccessResult } from "../types";

interface MovieCardProps {
  movie: SearchResult;
  onAddMovie: (id: string, title: string) => void;
  addingMovie: string | null;
  addSuccess: AddSuccessResult | null;
  loading: boolean;
}

export default function MovieCard({
  movie,
  onAddMovie,
  addingMovie,
  addSuccess,
  loading,
}: MovieCardProps) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex">
        {movie.poster && (
          <div className="w-24 h-36 mr-3 flex-shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.jpg";
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold">{movie.title}</h4>
          <p className="text-sm text-gray-600">
            {movie.prodYear} | {movie.director}
          </p>
          <p className="text-sm text-gray-600">
            {movie.runtime}분 | {movie.genre}
          </p>
          <p className="text-sm mt-2 line-clamp-3">{movie.plot}</p>

          <div className="mt-3">
            <button
              onClick={() => onAddMovie(movie.id, movie.title)}
              disabled={
                loading ||
                addingMovie === movie.id ||
                addSuccess?.id === movie.id
              }
              className={`px-3 py-1 text-sm rounded ${
                addSuccess?.id === movie.id
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
              }`}
            >
              {addingMovie === movie.id
                ? "추가 중..."
                : addSuccess?.id === movie.id
                ? "추가 완료"
                : "Supabase에 추가"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
