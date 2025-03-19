"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState } from "react";

// 리뷰 폼 컴포넌트의 props 타입 정의
interface ReviewFormProps {
  movieId: string; // 영화 ID
  initialContent?: string; // 초기 리뷰 내용 (수정 시 사용)
  initialRating?: number; // 초기 평점 (기본값: 5)
  onSubmitSuccess?: () => void; // 리뷰 제출 성공 시 실행할 콜백
}

// 로그인이 필요할 때 표시되는 컴포넌트
const LoginPrompt = () => (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
    <p className="mb-2">리뷰를 작성하려면 로그인이 필요합니다.</p>
    <Link
      href="/auth/login"
      className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      로그인하러 가기
    </Link>
  </div>
);

// 실제 리뷰 작성 폼 컴포넌트
const ReviewFormContent = ({
  content,
  setContent,
  rating,
  setRating,
  onSubmit,
  userNickname,
  isSubmitting,
}: {
  content: string;
  setContent: (content: string) => void;
  rating: number;
  setRating: (rating: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  userNickname: string;
  isSubmitting: boolean;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {/* 평점 선택 버튼 그룹 */}
    <div>
      <label className="block mb-1">평점</label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={`w-10 h-10 rounded-full ${
              rating >= value
                ? "bg-yellow-400 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            disabled={isSubmitting}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
    {/* 리뷰 내용 입력 영역 */}
    <div>
      <label htmlFor="content" className="block mb-1">
        내용
      </label>
      <textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="w-full p-2 border rounded h-24"
        placeholder="영화에 대한 리뷰를 작성해주세요."
        disabled={isSubmitting}
      />
    </div>
    {/* 제출 버튼과 작성자 정보 */}
    <div className="flex items-center space-x-2">
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? "등록 중..." : "리뷰 작성"}
      </button>
      <p className="text-sm text-gray-500">{userNickname} 님으로 작성됩니다.</p>
    </div>
  </form>
);

// 메인 ReviewForm 컴포넌트
export default function ReviewForm({
  movieId,
  initialContent = "",
  initialRating = 5,
  onSubmitSuccess,
}: ReviewFormProps) {
  // 상태 관리
  const { user, isAuthenticated } = useAuth(); // 사용자 인증 정보
  const { getUserNickname } = useUserProfile(); // 사용자 프로필 정보
  const [content, setContent] = useState(initialContent); // 리뷰 내용
  const [rating, setRating] = useState(initialRating); // 평점
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태

  // 리뷰 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;

    try {
      setIsSubmitting(true);
      // 리뷰 데이터 준비
      const userNickname = getUserNickname();
      const reviewData = {
        content,
        rating,
        author: userNickname,
        user_id: user.id,
      };

      // API 요청 전송
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

      // 성공 처리
      setContent("");
      setRating(5);
      alert("리뷰가 등록되었습니다.");

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "리뷰 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 컴포넌트 렌더링
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">리뷰 작성</h2>
      {!isAuthenticated ? (
        <LoginPrompt />
      ) : (
        <ReviewFormContent
          content={content}
          setContent={setContent}
          rating={rating}
          setRating={setRating}
          onSubmit={handleSubmit}
          userNickname={getUserNickname()}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
