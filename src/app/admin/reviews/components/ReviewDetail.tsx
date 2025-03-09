"use client";

import { Review } from "../types";

interface ReviewDetailProps {
  review: Review;
  onClose: () => void;
  onDelete: (reviewId: string) => void;
}

export default function ReviewDetail({
  review,
  onClose,
  onDelete,
}: ReviewDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">리뷰 상세</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">영화</h3>
            <p>{review.movie_title}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">작성자</h3>
            <p>{review.author}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">평점</h3>
            <p>{review.rating}점</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">작성일</h3>
            <p>{new Date(review.created_at).toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">내용</h3>
            <p className="whitespace-pre-wrap">{review.content}</p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => onDelete(review.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
