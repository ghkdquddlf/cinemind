"use client";

import Link from "next/link";
import { Reply } from "../types";
import { ReplySkeleton } from "./Skeletons";

interface RepliesTabProps {
  replies: Reply[];
  loading: boolean;
  error: string | null;
  onDeleteReply: (replyId: string) => Promise<void>;
}

export default function RepliesTab({
  replies,
  loading,
  error,
  onDeleteReply,
}: RepliesTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">내 답글</h2>
      {loading ? (
        // 답글 로딩 스켈레톤
        <>
          <ReplySkeleton />
          <ReplySkeleton />
          <ReplySkeleton />
        </>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : replies.length === 0 ? (
        <p className="text-gray-500">작성한 답글이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {replies.map((reply) => (
            <div key={reply.id} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    <Link
                      href={`/movies/${reply.reviews?.movie_id}`}
                      className="hover:underline"
                    >
                      {reply.reviews?.movies?.title || "알 수 없는 영화"}
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-500">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    원본 리뷰: {reply.reviews?.content?.substring(0, 50)}
                    {reply.reviews?.content && reply.reviews.content.length > 50
                      ? "..."
                      : ""}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteReply(reply.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
              <p className="mt-2 text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
