"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import ReplyList from "./ReplyList";

// 리뷰 데이터 타입 정의
interface Review {
  id: string; // 리뷰 ID
  author: string; // 작성자
  content: string; // 리뷰 내용
  created_at: string; // 작성일
  user_id?: string; // 작성자 ID
  rating?: number; // 평점
}

// ReviewList 컴포넌트 props 타입 정의
interface ReviewListProps {
  reviews?: Review[]; // 초기 리뷰 목록
  movieId: string; // 영화 ID
  onReviewDeleted?: () => void; // 리뷰 삭제 시 실행할 콜백
}

export default function ReviewList({
  reviews: initialReviews,
  movieId,
  onReviewDeleted,
}: ReviewListProps) {
  // 상태 관리
  const { user } = useAuth(); // 사용자 정보
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []); // 리뷰 목록
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null); // 수정 중인 리뷰 ID
  const [editContent, setEditContent] = useState(""); // 수정 중인 리뷰 내용
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태

  // 초기 리뷰 목록이 없을 경우 서버에서 가져오기
  useEffect(() => {
    if (!initialReviews) {
      fetchReviews();
    }
  }, [movieId, initialReviews]);

  // 리뷰 목록 가져오기
  const fetchReviews = async () => {
    const response = await fetch(`/api/movies/${movieId}/reviews`);

    if (!response.ok) {
      console.error("리뷰를 가져오는데 실패했습니다.");
      return;
    }

    const data = await response.json();
    setReviews(data.reviews || []);
  };

  // 리뷰 삭제 처리
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    const response = await fetch(`/api/movies/${movieId}/reviews/${reviewId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("리뷰 삭제에 실패했습니다.");
      return;
    }

    setReviews(reviews.filter((review) => review.id !== reviewId));
    onReviewDeleted?.();
    alert("리뷰가 삭제되었습니다.");
  };

  // 리뷰 수정 시작
  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
  };

  // 리뷰 수정 취소
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent("");
  };

  // 리뷰 수정 제출
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch(
      `/api/movies/${movieId}/reviews/${editingReviewId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      }
    );

    if (!response.ok) {
      setIsSubmitting(false);
      alert("리뷰 수정에 실패했습니다.");
      return;
    }

    const data = await response.json();
    setReviews(
      reviews.map((review) =>
        review.id === editingReviewId ? data.review : review
      )
    );

    handleCancelEdit();
    setIsSubmitting(false);
    alert("리뷰가 성공적으로 수정되었습니다.");
  };

  // 현재 사용자가 리뷰 작성자인지 확인
  const isReviewAuthor = (review: Review) => {
    return user && review.user_id === user.id;
  };

  // 리뷰 내용 렌더링
  const renderReviewContent = (review: Review) => (
    <>
      {/* 리뷰 헤더: 작성자 정보, 작성일, 평점 */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold">{review.author}</span>
          <span className="text-sm text-gray-500 ml-2">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
          {review.rating && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              평점: {review.rating}
            </span>
          )}
        </div>
        {/* 작성자인 경우 수정/삭제 버튼 표시 */}
        {isReviewAuthor(review) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditClick(review)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              수정
            </button>
            <button
              onClick={() => handleDeleteReview(review.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      {/* 리뷰 본문 */}
      <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>

      {/* 답글 영역 */}
      <div className="mt-4">
        <ReplyList
          reviewId={review.id}
          movieId={movieId}
          onReplyDeleted={onReviewDeleted || (() => {})}
        />
      </div>
    </>
  );

  // 리뷰 수정 폼 렌더링
  const renderEditForm = () => (
    <div className="border rounded p-4 bg-white">
      <h3 className="text-lg font-semibold mb-3">리뷰 수정</h3>
      <form onSubmit={handleSubmitEdit} className="space-y-3">
        <div>
          <label htmlFor="content" className="block mb-1 text-sm font-medium">
            내용
          </label>
          <textarea
            id="content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            required
            className="w-full p-2 border rounded h-24"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );

  // 메인 UI 렌더링
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">리뷰 ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 my-8">
          아직 작성된 리뷰가 없습니다.
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded p-4 bg-gray-50">
              {editingReviewId === review.id
                ? renderEditForm()
                : renderReviewContent(review)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
