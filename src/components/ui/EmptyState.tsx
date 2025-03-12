import React from "react";

interface EmptyStateProps {
  message?: string;
  className?: string;
}

/**
 * 데이터가 없을 때 표시하는 컴포넌트
 */
export default function EmptyState({
  message = "데이터가 없습니다.",
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="inline-block p-3 rounded-full bg-gray-100 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
