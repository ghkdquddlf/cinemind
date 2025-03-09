"use client";

import { SearchResult, AddSuccessResult } from "../types";
import MovieCard from "./MovieCard";

interface MovieSearchResultsProps {
  searchResults: SearchResult[];
  onAddMovie: (id: string, title: string) => void;
  addingMovie: string | null;
  addSuccess: AddSuccessResult | null;
  loading: boolean;
}

export default function MovieSearchResults({
  searchResults,
  onAddMovie,
  addingMovie,
  addSuccess,
  loading,
}: MovieSearchResultsProps) {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">검색 결과</h3>
      {searchResults.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onAddMovie={onAddMovie}
              addingMovie={addingMovie}
              addSuccess={addSuccess}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
