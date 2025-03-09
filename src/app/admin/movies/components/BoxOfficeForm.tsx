"use client";

import { useState } from "react";
import { BoxOfficeResult, BoxOfficeMovie } from "../types";
import { getYesterdayDate, formatDateForApi } from "../utils";

interface BoxOfficeFormProps {
  onFetchResults: (results: BoxOfficeResult[]) => void;
  onError: (error: string) => void;
  onLoading: (isLoading: boolean) => void;
}

export default function BoxOfficeForm({
  onFetchResults,
  onError,
  onLoading,
}: BoxOfficeFormProps) {
  const [date, setDate] = useState(getYesterdayDate());

  // 박스오피스 영화 데이터 수집 및 저장
  const fetchBoxOfficeMovies = async () => {
    try {
      onLoading(true);
      onError("");

      const dateParam = date ? `?targetDate=${formatDateForApi(date)}` : "";
      const response = await fetch(`/api/movies/complete${dateParam}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "영화 데이터 수집에 실패했습니다.");
      }

      const data = await response.json();
      onFetchResults(data.results);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "영화 데이터 수집 중 오류가 발생했습니다."
      );
    } finally {
      onLoading(false);
    }
  };

  // 박스오피스 영화 데이터 조회 (저장하지 않음)
  const fetchBoxOfficeOnly = async () => {
    try {
      onLoading(true);
      onError("");

      const dateParam = date ? `?targetDate=${formatDateForApi(date)}` : "";
      const response = await fetch(`/api/kobis/boxoffice${dateParam}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "박스오피스 데이터 조회에 실패했습니다."
        );
      }

      const data = await response.json();

      // 결과 형식 변환
      const formattedResults = data.movies.map((movie: BoxOfficeMovie) => ({
        title: movie.movieNm,
        movieCd: movie.movieCd,
        rank: movie.rank,
        openDt: movie.openDt,
        audiCnt: movie.audiCnt,
        audiAcc: movie.audiAcc,
        // 저장하지 않으므로 success 필드는 필요 없음
        type: "조회만 함",
      }));

      onFetchResults(formattedResults);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "박스오피스 데이터 조회 중 오류가 발생했습니다."
      );
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="mb-8 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">박스오피스 데이터</h2>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="targetDate" className="block mb-1">
            날짜 (YYYY-MM-DD)
          </label>
          <input
            type="date"
            id="targetDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex items-end space-x-2">
          <button
            onClick={fetchBoxOfficeOnly}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            title="박스오피스 데이터를 조회만 하고 저장하지 않습니다"
          >
            데이터 조회만
          </button>
          <button
            onClick={fetchBoxOfficeMovies}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            title="박스오피스 데이터를 가져와서 Supabase에 저장합니다"
          >
            데이터 수집 및 저장
          </button>
        </div>
      </div>
    </div>
  );
}
