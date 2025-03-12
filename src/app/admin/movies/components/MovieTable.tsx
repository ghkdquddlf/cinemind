import React from "react";
import { Column, DataTable } from "@/components/ui";
import { Movie } from "@/types";

interface MovieTableProps {
  movies: Movie[];
  formatDate: (date: string | undefined) => string;
  onDeleteMovie: (id: string) => void;
  loading: boolean;
}

/**
 * 영화 목록을 표시하는 테이블 컴포넌트
 */
export default function MovieTable({
  movies,
  formatDate,
  onDeleteMovie,
  loading,
}: MovieTableProps) {
  // 테이블 컬럼 정의
  const columns: Column<Movie>[] = [
    {
      header: "제목",
      accessor: "title",
      className: "font-medium text-gray-900",
    },
    {
      header: "개봉일",
      accessor: (movie) => formatDate(movie.release_date),
    },
    {
      header: "설명",
      accessor: (movie) => (
        <div className="max-w-xs truncate">{movie.overview || "정보 없음"}</div>
      ),
    },
    {
      header: "등록일",
      accessor: (movie) => formatDate(movie.created_at),
    },
    {
      header: "관리",
      accessor: (movie) => (
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => onDeleteMovie(movie.id)}
          disabled={loading}
        >
          삭제
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={movies}
      columns={columns}
      keyField="id"
      emptyMessage="등록된 영화가 없습니다."
    />
  );
}
