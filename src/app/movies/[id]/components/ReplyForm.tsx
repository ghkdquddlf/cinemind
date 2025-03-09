"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

interface ReplyFormProps {
  reviewId: string;
  movieId: string;
  onReplyAdded: () => void;
  onCancel: () => void;
}

export default function ReplyForm({
  reviewId,
  movieId,
  onReplyAdded,
  onCancel,
}: ReplyFormProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="mt-2 p-3 bg-gray-100 rounded">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="mb-2">답글을 작성하려면 로그인이 필요합니다.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 디버깅을 위한 사용자 정보 출력
      console.log("답글 작성 - 사용자 정보:", {
        id: user?.id,
        email: user?.email,
      });

      const response = await fetch(
        `/api/movies/${movieId}/reviews/${reviewId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            author: user?.email || "익명 사용자",
            content,
            user_id: user?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "답글 작성에 실패했습니다.");
      }

      // 폼 초기화
      setContent("");

      // 부모 컴포넌트에 알림
      onReplyAdded();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "답글 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 bg-gray-100 rounded">
      <h3 className="text-lg font-semibold mb-2">답글 작성</h3>
      <div className="mb-2">
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-20"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {user?.email || "익명 사용자"} 님으로 작성됩니다.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "제출 중..." : "답글 작성"}
          </button>
        </div>
      </div>
    </form>
  );
}
