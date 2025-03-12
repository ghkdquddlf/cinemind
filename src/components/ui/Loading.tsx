import React from "react";

interface LoadingProps {
  message?: string;
}

/**
 * 로딩 상태를 표시하는 컴포넌트
 */
export default function Loading({ message = "로딩 중..." }: LoadingProps) {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500 mb-2"></div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}
