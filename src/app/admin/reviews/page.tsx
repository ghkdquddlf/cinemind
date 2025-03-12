"use client";

import { ErrorMessage, Loading, SearchBar } from "@/components/ui";
import { useReviews } from "@/hooks";
import ReviewHeader from "./components/ReviewHeader";
import ReviewTable from "./components/ReviewTable";

/**
 * 리뷰 관리 페이지
 */
export default function AdminReviewsPage() {
  const {
    reviews,
    loading,
    error,
    formatDate,
    renderStars,
    deleteReview,
    searchReviews,
  } = useReviews();

  return (
    <div className="container mx-auto p-4">
      <ReviewHeader error={error} />

      <SearchBar
        placeholder="영화 제목, 사용자 이름 또는 내용으로 검색"
        onSearch={searchReviews}
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="리뷰 데이터를 불러오는 중..." />
      ) : (
        <ReviewTable
          reviews={reviews}
          formatDate={formatDate}
          renderStars={renderStars}
          onDeleteReview={deleteReview}
          loading={loading}
        />
      )}
    </div>
  );
}
