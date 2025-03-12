"use client";

import { ErrorMessage, Loading, SearchBar } from "@/components/ui";
import { useMovieList } from "@/hooks";
import MovieHeader from "../movies/components/MovieHeader";
import MovieTable from "../movies/components/MovieTable";

/**
 * 영화 목록 관리 페이지
 */
export default function AdminMovieListPage() {
  const { movies, loading, error, formatDate, deleteMovie, searchMovies } =
    useMovieList();

  return (
    <div className="container mx-auto p-4">
      <MovieHeader error={error} />

      <SearchBar
        placeholder="영화 제목 또는 설명으로 검색"
        onSearch={searchMovies}
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="영화 데이터를 불러오는 중..." />
      ) : (
        <MovieTable
          movies={movies}
          formatDate={formatDate}
          onDeleteMovie={deleteMovie}
          loading={loading}
        />
      )}
    </div>
  );
}
