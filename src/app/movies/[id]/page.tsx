"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface MovieDetail {
  movieNm: string;
  movieNmEn: string;
  prdtYear: string;
  openDt: string;
  genreAlt: string;
  nations: { nationNm: string }[];
  directors: { peopleNm: string }[];
  actors: { peopleNm: string; cast: string }[];
}

export default function MovieDetailPage() {
  const { id } = useParams(); // URL에서 영화 ID 가져오기
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/kobis/${id}`);
        if (!res.ok) throw new Error("API 요청 실패");

        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("영화 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchMovie();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (!movie)
    return (
      <p className="text-center text-red-500">영화 정보를 찾을 수 없습니다.</p>
    );

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600">
        {movie.movieNm} ({movie.movieNmEn})
      </h1>
      <p className="text-gray-700">개봉 연도: {movie.prdtYear}</p>
      <p className="text-gray-700">개봉일: {movie.openDt || "정보 없음"}</p>
      <p className="text-gray-700">장르: {movie.genreAlt || "정보 없음"}</p>
      <p className="text-gray-700">
        제작 국가:{" "}
        {movie.nations?.map((n) => n.nationNm).join(", ") || "정보 없음"}
      </p>
      <p className="text-gray-700">
        감독:{" "}
        {movie.directors?.map((d) => d.peopleNm).join(", ") || "정보 없음"}
      </p>

      <h2 className="text-2xl font-bold mt-6">출연진</h2>
      <ul className="list-disc ml-6">
        {movie.actors?.map((actor, index) => (
          <li key={index} className="text-gray-700">
            {actor.peopleNm} ({actor.cast || "배역 정보 없음"})
          </li>
        ))}
      </ul>
    </main>
  );
}
