"use client";

import React, { useState } from "react";

interface EditReviewFormProps {
    reviewId: string;
    initialContent: string;
    movieId: string;
    onCancel: () => void;
    onReviewUpdated: () => void;
}

export default function EditReviewForm({
    reviewId,
    initialContent,
    movieId,
    onCancel,
    onReviewUpdated,
}: EditReviewFormProps) {
    const [content, setContent] = useState(initialContent);
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            setError("비밀번호를 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch(`/api/movies/${movieId}/reviews`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reviewId,
                    content,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "리뷰 수정에 실패했습니다.");
            }

            alert("리뷰가 수정되었습니다.");
            onReviewUpdated();
        } catch (error) {
            setError(error instanceof Error ? error.message : "리뷰 수정 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border rounded p-4 bg-white">
            <h3 className="text-lg font-semibold mb-3">리뷰 수정</h3>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label htmlFor="content" className="block mb-1 text-sm font-medium">
                        내용
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className="w-full p-2 border rounded h-24"
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-1 text-sm font-medium">
                        비밀번호 확인
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                        disabled={isSubmitting}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "수정 중..." : "수정 완료"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
} 