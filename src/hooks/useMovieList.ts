import { useState, useEffect, useCallback } from "react";
import { Movie } from "@/types";
import { supabase } from "@/lib/supabase";

/**
 * 영화 목록을 관리하는 커스텀 훅
 */
export function useMovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 영화 목록 가져오기
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setMovies(data || []);
      setFilteredMovies(data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "영화 데이터를 불러오는 중 오류가 발생했습니다."
      );
      setMovies([]);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 영화 검색
  const searchMovies = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredMovies(movies);
        return;
      }

      const lowerCaseQuery = query.toLowerCase();
      const filtered = movies.filter(
        (movie) =>
          (movie.title && movie.title.toLowerCase().includes(lowerCaseQuery)) ||
          (movie.overview &&
            movie.overview.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredMovies(filtered);
    },
    [movies]
  );

  // 영화 삭제
  const deleteMovie = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase.from("movies").delete().eq("id", id);

        if (error) {
          throw new Error(error.message);
        }

        // 삭제 후 목록 업데이트
        const updatedMovies = movies.filter((movie) => movie.id !== id);
        setMovies(updatedMovies);
        setFilteredMovies(filteredMovies.filter((movie) => movie.id !== id));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "영화를 삭제하는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [movies, filteredMovies]
  );

  // 날짜 포맷팅
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "정보 없음";

    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // 컴포넌트 마운트 시 영화 목록 가져오기
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    movies: filteredMovies,
    allMovies: movies,
    loading,
    error,
    fetchMovies,
    deleteMovie,
    formatDate,
    searchMovies,
    searchQuery,
  };
}
