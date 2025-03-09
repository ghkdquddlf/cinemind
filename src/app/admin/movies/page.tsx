"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoxOfficeResult, SearchResult, AddSuccessResult } from "./types";
import BoxOfficeForm from "./components/BoxOfficeForm";
import BoxOfficeResults from "./components/BoxOfficeResults";
import MovieSearchForm from "./components/MovieSearchForm";
import MovieSearchResults from "./components/MovieSearchResults";

export default function AdminMoviesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BoxOfficeResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [addingMovie, setAddingMovie] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<AddSuccessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // KMDB 영화를 Supabase에 추가
  const addMovieToSupabase = async (kmdbId: string, title: string) => {
    try {
      setAddingMovie(kmdbId);
      setError(null);
      setAddSuccess(null);

      const response = await fetch("/api/movies/add-from-kmdb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kmdbId, title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "영화 추가에 실패했습니다.");
      }

      setAddSuccess({ id: kmdbId, title });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "영화 추가 중 오류가 발생했습니다."
      );
    } finally {
      setAddingMovie(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">영화 데이터 관리</h1>

      <BoxOfficeForm
        onFetchResults={setResults}
        onError={setError}
        onLoading={setLoading}
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {addSuccess && (
        <p className="text-green-500 mb-4">
          영화 &ldquo;{addSuccess.title}&rdquo;가 성공적으로 추가되었습니다!
        </p>
      )}

      <BoxOfficeResults results={results} />

      <MovieSearchForm
        onSearchResults={setSearchResults}
        onError={setError}
        onLoading={setLoading}
      />

      <MovieSearchResults
        searchResults={searchResults}
        onAddMovie={addMovieToSupabase}
        addingMovie={addingMovie}
        addSuccess={addSuccess}
        loading={loading}
      />

      <div className="flex justify-end">
        <button
          onClick={() => router.push("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
