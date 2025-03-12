"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState } from "react";

interface ReviewFormProps {
  movieId: string;
  content?: string;
  onContentChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  rating?: number;
  onRatingChange?: (value: number) => void;
}

export default function ReviewForm({
  movieId,
  content: propContent,
  onContentChange,
  onSubmit: propOnSubmit,
  rating: propRating = 5,
  onRatingChange,
}: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();
  const { getUserNickname, loading: profileLoading } = useUserProfile();
  const [content, setContent] = useState(propContent || "");
  const [rating, setRating] = useState(propRating);
  const [loading, setLoading] = useState(false);

  // 내부 상태 변경 핸들러
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      alert("리뷰를 작성하려면 로그인이 필요합니다.");
      return;
    }

    // 외부에서 제공된 submit 핸들러가 있으면 사용
    if (propOnSubmit) {
      propOnSubmit(e);
      return;
    }

    // 내부 submit 로직
    try {
      setLoading(true);

      // 사용자 닉네임 가져오기
      const userNickname = getUserNickname();

      const reviewData = {
        content,
        rating,
        author: userNickname,
        user_id: user.id,
      };

      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "리뷰 작성에 실패했습니다.");
      }

      setContent("");
      setRating(5);
      alert("리뷰가 등록되었습니다.");

      // 페이지 새로고침
      window.location.reload();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "리뷰 작성 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 로그인 상태 로딩 중
  if (loading || profileLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">리뷰 작성</h2>
        <div className="p-4 bg-gray-100 rounded">
          사용자 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">리뷰 작성</h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="mb-2">리뷰를 작성하려면 로그인이 필요합니다.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  // 로그인한 경우
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">리뷰 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">평점</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingChange(value)}
                className={`w-10 h-10 rounded-full ${
                  rating >= value
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            required
            className="w-full p-2 border rounded h-24"
            placeholder="영화에 대한 리뷰를 작성해주세요."
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            리뷰 작성
          </button>
          <p className="text-sm text-gray-500">
            {getUserNickname()} 님으로 작성됩니다.
          </p>
        </div>
      </form>
    </div>
  );
}
