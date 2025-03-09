"use client";

import { useState } from "react";
import { SearchResult } from "../types";

interface MovieSearchFormProps {
  onSearchResults: (results: SearchResult[]) => void;
  onError: (error: string) => void;
  onLoading: (isLoading: boolean) => void;
}

export default function MovieSearchForm({
  onSearchResults,
  onError,
  onLoading,
}: MovieSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // KMDb 영화 검색
  const searchKMDbMovies = async () => {
    if (!searchTerm.trim()) {
      onError("검색어를 입력해주세요.");
      return;
    }

    try {
      onLoading(true);
      onError("");

      console.log(`[MovieSearchForm] KMDB 검색 시작: "${searchTerm}"`);
      const response = await fetch(
        `/api/kmdb?query=${encodeURIComponent(searchTerm)}`
      );
      console.log(`[MovieSearchForm] KMDB 검색 응답 상태: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "영화 검색에 실패했습니다.");
      }

      const responseText = await response.text();
      console.log(
        `[MovieSearchForm] 응답 텍스트 (처음 100자): ${responseText.substring(
          0,
          100
        )}...`
      );

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`[MovieSearchForm] JSON 파싱 오류:`, e);
        throw new Error("API 응답을 JSON으로 파싱할 수 없습니다.");
      }

      console.log(
        `[MovieSearchForm] 검색 결과 수: ${data.results?.length || 0}`
      );
      onSearchResults(data.results || []);
    } catch (error) {
      console.error(`[MovieSearchForm] 검색 오류:`, error);
      onError(
        error instanceof Error
          ? error.message
          : "영화 검색 중 오류가 발생했습니다."
      );
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="mb-8 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">영화 검색 및 추가 (KMDb)</h2>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="searchQuery" className="block mb-1">
            영화 제목
          </label>
          <input
            type="text"
            id="searchQuery"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchKMDbMovies();
              }
            }}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={searchKMDbMovies}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
}
