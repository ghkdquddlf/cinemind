"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Review, Movie, FilterState } from "./types";
import ReviewFilter from "./components/ReviewFilter";
import ReviewTable from "./components/ReviewTable";
import ReviewDetail from "./components/ReviewDetail";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // 필터 상태
  const [filters, setFilters] = useState<FilterState>({
    filterMovie: "",
    filterRating: "",
    searchTerm: "",
  });

  const supabase = createClient();

  // 리뷰 목록 가져오기
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 리뷰 가져오기
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // 영화 정보 가져오기
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("id, title");

      if (moviesError) throw moviesError;

      // 영화 정보 저장
      setMovies(moviesData);

      // 리뷰에 영화 제목 추가
      const reviewsWithMovieTitle = reviewsData.map((review: Review) => {
        const movie = moviesData.find((m) => m.id === review.movie_id);
        return {
          ...review,
          movie_title: movie ? movie.title : "알 수 없는 영화",
        };
      });

      setReviews(reviewsWithMovieTitle);
    } catch (err) {
      console.error("리뷰 목록을 가져오는 중 오류 발생:", err);
      setError("리뷰 목록을 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 리뷰 삭제
  const handleDeleteReview = async (id: string) => {
    try {
      setLoading(true);

      // 리뷰에 달린 답글 먼저 삭제
      await supabase.from("review_replies").delete().eq("review_id", id);

      // 리뷰 삭제
      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;

      // 리뷰 목록 다시 가져오기
      await fetchReviews();
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error("리뷰 삭제 중 오류 발생:", err);
      setError("리뷰를 삭제하는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilters({
      filterMovie: "",
      filterRating: "",
      searchTerm: "",
    });
  };

  // 필터링된 리뷰 목록
  const filteredReviews = reviews.filter((review) => {
    // 영화 필터
    if (filters.filterMovie && review.movie_id !== filters.filterMovie) {
      return false;
    }

    // 평점 필터
    if (
      filters.filterRating &&
      review.rating !== parseInt(filters.filterRating)
    ) {
      return false;
    }

    // 검색어 필터
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return (
        review.author.toLowerCase().includes(term) ||
        review.content.toLowerCase().includes(term) ||
        (review.movie_title && review.movie_title.toLowerCase().includes(term))
      );
    }

    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">리뷰 관리</h1>

      {/* 필터 및 검색 */}
      <ReviewFilter
        movies={movies}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      {/* 리뷰 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ReviewTable
          reviews={filteredReviews}
          loading={loading}
          onViewReview={setSelectedReview}
          onDeleteClick={(reviewId) => {
            setReviewToDelete(reviewId);
            setShowDeleteConfirm(true);
          }}
        />
      </div>

      {/* 리뷰 상세 모달 */}
      {selectedReview && (
        <ReviewDetail
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={(reviewId) => {
            setReviewToDelete(reviewId);
            setShowDeleteConfirm(true);
            setSelectedReview(null);
          }}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onCancel={() => {
            setShowDeleteConfirm(false);
            setReviewToDelete(null);
          }}
          onConfirm={() => reviewToDelete && handleDeleteReview(reviewToDelete)}
          loading={loading}
        />
      )}
    </div>
  );
}
