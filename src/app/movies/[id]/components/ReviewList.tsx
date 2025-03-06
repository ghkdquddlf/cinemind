import React, { useState } from "react";

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  movieId: string;
  onReviewDeleted: () => void;
}

export default function ReviewList({
  reviews,
  movieId,
  onReviewDeleted,
}: ReviewListProps) {
  const [deletePasswords, setDeletePasswords] = useState<{
    [key: string]: string;
  }>({});
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const handleDeleteClick = async (reviewId: string) => {
    const password = deletePasswords[reviewId];
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "리뷰 삭제에 실패했습니다.");
      }

      // 성공적으로 삭제된 경우 상태 초기화
      setDeletePasswords((prev) => {
        const newPasswords = { ...prev };
        delete newPasswords[reviewId];
        return newPasswords;
      });
      setDeletingReviewId(null);

      alert("리뷰가 삭제되었습니다.");
      onReviewDeleted();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "리뷰 삭제 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">리뷰 목록</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold">{review.author}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {deletingReviewId === review.id ? (
                    <>
                      <input
                        type="password"
                        placeholder="비밀번호"
                        className="border rounded px-2 py-1 text-sm"
                        value={deletePasswords[review.id] || ""}
                        onChange={(e) =>
                          setDeletePasswords((prev) => ({
                            ...prev,
                            [review.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleDeleteClick(review.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => {
                          setDeletingReviewId(null);
                          setDeletePasswords((prev) => {
                            const newPasswords = { ...prev };
                            delete newPasswords[review.id];
                            return newPasswords;
                          });
                        }}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeletingReviewId(review.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
