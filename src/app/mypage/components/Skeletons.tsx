"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// 리뷰 스켈레톤 컴포넌트
export const ReviewSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-start gap-4">
        <div className="w-20 h-28">
          <Skeleton height="100%" />
        </div>
        <div className="flex-1">
          <Skeleton height={24} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" className="mb-3" />
          <Skeleton height={16} count={2} className="mb-2" />
          <div className="flex justify-between mt-4">
            <Skeleton height={20} width={100} />
            <Skeleton height={30} width={80} />
          </div>
        </div>
      </div>
    </div>
  );
};

// 답글 스켈레톤 컴포넌트
export const ReplySkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <Skeleton height={20} width="70%" className="mb-2" />
      <Skeleton height={16} width="50%" className="mb-3" />
      <Skeleton height={16} count={2} className="mb-2" />
      <div className="flex justify-between mt-4">
        <Skeleton height={20} width={100} />
        <Skeleton height={30} width={80} />
      </div>
    </div>
  );
};

// 영화 스켈레톤 컴포넌트
export const MovieSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-start gap-4">
        <div className="w-20 h-28 relative">
          <Skeleton height="100%" />
        </div>
        <div className="flex-1">
          <Skeleton height={24} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" className="mb-3" />
          <div className="flex justify-end mt-4">
            <Skeleton height={30} width={80} />
          </div>
        </div>
      </div>
    </div>
  );
};
