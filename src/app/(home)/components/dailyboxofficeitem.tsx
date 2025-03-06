// src/app/(home)/components/MovieItem.tsx
import Link from "next/link";
import Image from "next/image";

interface Movie {
  movieCd: string;
  rank: string;
  movieNm: string;
  openDt: string;
  audiCnt: string;
  salesAmt: string;
  poster_path?: string;
}

export function MovieItem({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movies/${movie.movieCd}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-[600px] flex flex-col">
        <div className="relative h-[400px]">
          <Image
            src={movie.poster_path || "/default-movie-image.jpg"}
            alt={movie.movieNm}
            fill
            className="object-cover"
          />
          <div className="absolute top-0 left-0 bg-blue-500 text-white px-3 py-1 rounded-br-lg">
            {movie.rank}위
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-xl font-bold mb-2 line-clamp-2 h-[3.5rem]">
            {movie.movieNm}
          </h2>
          <div className="space-y-1 text-gray-600 mt-auto">
            <p>개봉일: {movie.openDt}</p>
            <p>관객 수: {Number(movie.audiCnt).toLocaleString()}명</p>
            <p>매출액: {Number(movie.salesAmt).toLocaleString()}원</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
