"use client";

import Image from "next/image";
import Link from "next/link";
import { Review } from "../types";
import { ReviewSkeleton } from "./Skeletons";

interface ReviewsTabProps {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  onDeleteReview: (reviewId: string) => Promise<void>;
}

export default function ReviewsTab({
  reviews,
  loading,
  error,
  onDeleteReview,
}: ReviewsTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">내 리뷰</h2>
      {loading ? (
        // 리뷰 로딩 스켈레톤
        <>
          <ReviewSkeleton />
          <ReviewSkeleton />
          <ReviewSkeleton />
        </>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 relative">
                    <Image
                      src={
                        review.movies?.poster_path || "/default-movie-image.jpg"
                      }
                      alt={review.movies?.title || "영화 포스터"}
                      fill
                      sizes="(max-width: 768px) 48px, 64px"
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      <Link
                        href={`/movies/${review.movie_id}`}
                        className="hover:underline"
                      >
                        {review.movies?.title || "알 수 없는 영화"}
                      </Link>
                    </h3>
                    <div className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteReview(review.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
              <div className="mt-2">
                {review.rating && (
                  <div className="mb-1">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      평점: {review.rating}
                    </span>
                  </div>
                )}
                <p className="text-gray-700">{review.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
