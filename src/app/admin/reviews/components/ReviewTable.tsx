"use client";

import React from "react";
import { Column, DataTable } from "@/components/ui";
import { Review } from "@/types";

interface ReviewTableProps {
  reviews: Review[];
  formatDate: (dateString: string) => string;
  renderStars: (rating: number) => string;
  onDeleteReview: (id: string) => void;
  loading: boolean;
}

/**
 * 리뷰 목록을 표시하는 테이블 컴포넌트
 */
export default function ReviewTable({
  reviews,
  formatDate,
  renderStars,
  onDeleteReview,
  loading,
}: ReviewTableProps) {
  // 테이블 컬럼 정의
  const columns: Column<Review>[] = [
    {
      header: "영화",
      accessor: "movie_title",
      className: "font-medium text-gray-900",
    },
    {
      header: "사용자",
      accessor: "user_email",
    },
    {
      header: "평점",
      accessor: (review) => (
        <span className="text-yellow-500">{renderStars(review.rating)}</span>
      ),
    },
    {
      header: "내용",
      accessor: (review) => (
        <div className="max-w-xs truncate">{review.content}</div>
      ),
    },
    {
      header: "작성일",
      accessor: (review) => formatDate(review.created_at),
    },
    {
      header: "관리",
      accessor: (review) => (
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => onDeleteReview(review.id)}
          disabled={loading}
        >
          삭제
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={reviews}
      columns={columns}
      keyField="id"
      emptyMessage="등록된 리뷰가 없습니다."
    />
  );
}
