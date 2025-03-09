"use client";

import React, { useState, useEffect } from "react";
import EditReviewForm from "./EditReviewForm";
import ReplyForm from "./ReplyForm";
import ReplyList from "./ReplyList";
import { useAuth } from "@/lib/hooks/useAuth";

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
  user_id?: string;
  rating?: number;
}

interface ReviewListProps {
  reviews?: Review[];
  movieId: string;
  onReviewDeleted?: () => void;
}

export default function ReviewList({
  reviews: propReviews,
  movieId,
  onReviewDeleted,
}: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(propReviews || []);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [showRepliesForReviewId, setShowRepliesForReviewId] = useState<{
    [key: string]: boolean;
  }>({});

  // 외부에서 reviews를 제공하지 않은 경우 직접 가져오기
  useEffect(() => {
    if (!propReviews) {
      fetchReviews();
    }
  }, [movieId, propReviews]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/movies/${movieId}/reviews`);

      if (!response.ok) {
        throw new Error("리뷰를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/movies/${movieId}/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("리뷰 삭제에 실패했습니다.");
      }

      // 리뷰 목록에서 삭제된 리뷰 제거
      setReviews(reviews.filter((review) => review.id !== reviewId));

      // 외부에서 제공된 콜백이 있으면 호출
      if (onReviewDeleted) {
        onReviewDeleted();
      }

      alert("리뷰가 삭제되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (reviewId: string) => {
    setEditingReviewId(reviewId);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  const handleReviewUpdated = () => {
    setEditingReviewId(null);
    if (onReviewDeleted) onReviewDeleted();
  };

  const handleReplyClick = (reviewId: string) => {
    setReplyingToReviewId(reviewId);
  };

  const handleCancelReply = () => {
    setReplyingToReviewId(null);
  };

  const handleReplyAdded = () => {
    setReplyingToReviewId(null);
    // 답글이 추가되면 해당 리뷰의 답글 목록을 자동으로 표시
    setShowRepliesForReviewId((prev) => ({
      ...prev,
      [replyingToReviewId!]: true,
    }));
  };

  const toggleReplies = (reviewId: string) => {
    setShowRepliesForReviewId((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  // 현재 사용자가 리뷰 작성자인지 확인
  const isReviewAuthor = (review: Review) => {
    return user && review.user_id === user.id;
  };

  // ReplyList 컴포넌트에 전달할 콜백 함수
  const handleReplyDeleted = () => {
    if (onReviewDeleted) onReviewDeleted();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">리뷰 ({reviews.length})</h2>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500 my-8">
          아직 작성된 리뷰가 없습니다.
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded p-4 bg-gray-50">
              {editingReviewId === review.id ? (
                <EditReviewForm
                  reviewId={review.id}
                  initialContent={review.content}
                  movieId={movieId}
                  onCancel={handleCancelEdit}
                  onReviewUpdated={handleReviewUpdated}
                />
              ) : (
                <>
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
                    {isReviewAuthor(review) && (
                      <div className="flex items-center gap-2">
                        {deletingReviewId === review.id ? (
                          <>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                            >
                              확인
                            </button>
                            <button
                              onClick={() => setDeletingReviewId(null)}
                              className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(review.id)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => setDeletingReviewId(review.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.content}
                  </p>

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleReplyClick(review.id)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      답글 작성
                    </button>
                    <button
                      onClick={() => toggleReplies(review.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {showRepliesForReviewId[review.id]
                        ? "답글 숨기기"
                        : "답글 보기"}
                    </button>
                  </div>

                  {replyingToReviewId === review.id && (
                    <ReplyForm
                      reviewId={review.id}
                      movieId={movieId}
                      onReplyAdded={handleReplyAdded}
                      onCancel={handleCancelReply}
                    />
                  )}

                  {showRepliesForReviewId[review.id] && (
                    <ReplyList
                      reviewId={review.id}
                      movieId={movieId}
                      onReplyDeleted={handleReplyDeleted}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
