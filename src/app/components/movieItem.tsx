import { useEffect, useState } from "react";
import Link from "next/link";

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

export function MovieItem({ id }: { id: string }) {
  const [details, setDetails] = useState<MovieDetail | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/kobis/${id}`);
        if (!res.ok) throw new Error("API 요청 실패");

        const data = await res.json();
        setDetails(data);
      } catch (error) {
        console.error("상세 정보를 가져오는 중 오류 발생:", error);
      }
    }

    if (id) fetchDetails();
  }, [id]);

  if (!details) return <p>로딩 중...</p>;

  return (
    <Link key={id} href={`/movies/${id}`}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">
          {details.movieNm} ({details.movieNmEn})
        </h2>
        <p className="text-gray-600">개봉 연도: {details.prdtYear}</p>
        <p className="text-gray-600">개봉일: {details.openDt || "정보 없음"}</p>
        <p className="text-gray-600">장르: {details.genreAlt || "정보 없음"}</p>
        <p className="text-gray-600">
          제작 국가:{" "}
          {details.nations?.map((n) => n.nationNm).join(", ") || "정보 없음"}
        </p>
        <p className="text-gray-600">
          감독:{" "}
          {details.directors?.map((d) => d.peopleNm).join(", ") || "정보 없음"}
        </p>
      </div>
    </Link>
  );
}
