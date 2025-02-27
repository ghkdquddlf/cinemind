"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Movie {
  movieCd: string;
  rank: string;
  movieNm: string;
  openDt: string;
  audiCnt: string;
  salesAmt: string;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    async function fetchMovies() {
      const res = await fetch("/api/kobis");
      const data = await res.json();
      setMovies(data);
    }
    fetchMovies();
  }, []);

  console.log(movies);
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        🎬 일별 박스오피스
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {movies.map((movie) => (
          <Link key={movie.movieCd} href={`/movies/${movie.movieCd}`}>
            <div key={movie.rank} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">
                {movie.rank}. {movie.movieNm}
              </h2>
              <p className="text-gray-600">개봉일: {movie.openDt}</p>
              <p className="text-gray-600">
                관객 수: {Number(movie.audiCnt).toLocaleString()}명
              </p>
              <p className="text-gray-600">
                매출액: {Number(movie.salesAmt).toLocaleString()}원
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
