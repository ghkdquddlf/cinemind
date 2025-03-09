"use client";

import { FaEye, FaTrash } from "react-icons/fa";
import { Review } from "../types";

interface ReviewTableProps {
  reviews: Review[];
  loading: boolean;
  onViewReview: (review: Review) => void;
  onDeleteClick: (reviewId: string) => void;
}

export default function ReviewTable({
  reviews,
  loading,
  onViewReview,
  onDeleteClick,
}: ReviewTableProps) {
  if (loading && reviews.length === 0) {
    return <div className="p-4 text-center">리뷰 목록을 불러오는 중...</div>;
  }

  if (reviews.length === 0) {
    return <div className="p-4 text-center">리뷰가 없습니다.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              영화
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작성자
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              내용
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              평점
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작성일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              관리
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {review.movie_title}
                </div>
                <div className="text-sm text-gray-500">
                  ID: {review.movie_id}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{review.author}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 line-clamp-2">
                  {review.content}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {review.rating}점
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onViewReview(review)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                  title="상세 보기"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => onDeleteClick(review.id)}
                  className="text-red-600 hover:text-red-900"
                  title="삭제"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
