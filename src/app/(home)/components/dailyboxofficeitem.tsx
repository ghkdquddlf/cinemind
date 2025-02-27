// src/app/(home)/components/MovieItem.tsx
import Link from "next/link";

interface Movie {
    movieCd: string;
    rank: string;
    movieNm: string;
    openDt: string;
    audiCnt: string;
    salesAmt: string;
}

export function MovieItem({ movie }: { movie: Movie }) {
    return (
        <Link key={movie.movieCd} href={`/movies/${movie.movieCd}`}>
            <div className="bg-white p-4 rounded-lg shadow-md">
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
    );
}
