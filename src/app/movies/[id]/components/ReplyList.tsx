"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import ReplyForm from "./ReplyForm";

interface Reply {
  id: string;
  author: string;
  content: string;
  created_at: string;
  user_id?: string;
}

interface ReplyListProps {
  reviewId: string;
  movieId: string;
  onReplyDeleted: () => void;
}

export default function ReplyList({
  reviewId,
  movieId,
  onReplyDeleted,
}: ReplyListProps) {
  const { user, isAuthenticated } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [isWritingReply, setIsWritingReply] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [reviewId, movieId]);

  const fetchReplies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/movies/${movieId}/reviews/${reviewId}/replies`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "답글을 가져오는데 실패했습니다.");
      }

      setReplies(data.replies || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "답글을 가져오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (replyId: string) => {
    if (!isAuthenticated || !user) {
      alert("답글을 삭제하려면 로그인이 필요합니다.");
      return;
    }

    // 삭제 확인
    if (!confirm("정말로 이 답글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/movies/${movieId}/reviews/${reviewId}/replies`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replyId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "답글 삭제에 실패했습니다.");
      }

      setDeletingReplyId(null);
      alert("답글이 삭제되었습니다.");
      onReplyDeleted();
      fetchReplies();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "답글 삭제 중 오류가 발생했습니다."
      );
    }
  };

  // 현재 사용자가 답글 작성자인지 확인
  const isReplyAuthor = (reply: Reply) => {
    return isAuthenticated && user && reply.user_id === user.id;
  };

  // 답글 작성 완료 후 처리
  const handleReplyAdded = () => {
    setIsWritingReply(false);
    fetchReplies();
  };

  if (loading) return <div className="text-center py-2">답글 로딩 중...</div>;
  if (error) return <div className="text-red-500 py-2">{error}</div>;

  return (
    <div className="mt-3 pl-4 border-l-2 border-gray-300">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-600">
          답글 {replies.length}개
        </h4>
        {!isWritingReply && (
          <button
            onClick={() => setIsWritingReply(true)}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            답글 작성
          </button>
        )}
      </div>

      {/* 답글 작성 폼 */}
      {isWritingReply && (
        <ReplyForm
          reviewId={reviewId}
          movieId={movieId}
          onReplyAdded={handleReplyAdded}
          onCancel={() => setIsWritingReply(false)}
        />
      )}

      {/* 답글 목록 */}
      {replies.length === 0 ? (
        <div className="text-gray-500 text-sm py-2">아직 답글이 없습니다.</div>
      ) : (
        <div className="space-y-3 mt-3">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-100 p-3 rounded">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="font-medium text-sm">{reply.author}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </span>
                </div>
                {isReplyAuthor(reply) && (
                  <div>
                    {deletingReplyId === reply.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteClick(reply.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          확인
                        </button>
                        <button
                          onClick={() => setDeletingReplyId(null)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingReplyId(reply.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
