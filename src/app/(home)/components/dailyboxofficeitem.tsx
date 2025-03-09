// src/app/(home)/components/MovieItem.tsx
import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";

interface Movie {
  movieCd: string;
  rank: string;
  movieNm: string;
  openDt: string;
  audiCnt: string;
  salesAmt: string;
  poster_path?: string;
}

// 메모이제이션을 적용하여 불필요한 리렌더링 방지
export const MovieItem = memo(function MovieItem({ movie }: { movie: Movie }) {
  const [imgError, setImgError] = useState(false);
  const posterPath = imgError
    ? "/default-movie-image.jpg"
    : movie.poster_path || "/default-movie-image.jpg";

  return (
    <Link href={`/movies/${movie.movieCd}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-[600px] flex flex-col">
        <div className="relative h-[400px]">
          <Image
            src={posterPath}
            alt={movie.movieNm}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            onError={() => setImgError(true)}
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
          </div>
        </div>
      </div>
    </Link>
  );
});
