import React from "react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

/**
 * 에러 메시지를 표시하는 컴포넌트
 */
export default function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 ${className}`}
    >
      <p>{message}</p>
    </div>
  );
}
