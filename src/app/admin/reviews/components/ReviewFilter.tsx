"use client";

import { FaFilter, FaSearch } from "react-icons/fa";
import { Movie, FilterState } from "../types";

interface ReviewFilterProps {
  movies: Movie[];
  filters: FilterState;
  onFilterChange: (name: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
}

export default function ReviewFilter({
  movies,
  filters,
  onFilterChange,
  onResetFilters,
}: ReviewFilterProps) {
  const { filterMovie, filterRating, searchTerm } = filters;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            영화 필터
          </label>
          <div className="relative">
            <select
              value={filterMovie}
              onChange={(e) => onFilterChange("filterMovie", e.target.value)}
              className="pl-8 pr-4 py-2 border rounded-md w-full"
            >
              <option value="">모든 영화</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            평점 필터
          </label>
          <div className="relative">
            <select
              value={filterRating}
              onChange={(e) => onFilterChange("filterRating", e.target.value)}
              className="pl-8 pr-4 py-2 border rounded-md w-full"
            >
              <option value="">모든 평점</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}점
                </option>
              ))}
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            검색
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onFilterChange("searchTerm", e.target.value)}
              placeholder="작성자 또는 내용 검색"
              className="pl-8 pr-4 py-2 border rounded-md w-full"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <button
          onClick={onResetFilters}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          필터 초기화
        </button>
      </div>
    </div>
  );
}
