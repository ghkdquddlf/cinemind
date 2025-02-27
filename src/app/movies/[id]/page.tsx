// src/app/movies/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { MovieItem } from "@/app/components/movieItem";

export default function MovieDetailPage() {
  const { id } = useParams(); // URL에서 영화 ID 가져오기

  if (!id || Array.isArray(id)) {
    return <p>영화 ID를 찾을 수 없습니다.</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600">영화 상세 정보</h1>
      <MovieItem id={id} />
    </main>
  );
}