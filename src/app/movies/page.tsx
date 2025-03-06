import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types/movie";

// 24시간마다 데이터 재검증
export const revalidate = 86400; // 24시간(초 단위)

async function getMovies() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/movies`,
      {
        next: {
          revalidate: 86400, // 24시간마다 재검증
        },
      }
    );

    if (!response.ok) {
      throw new Error("영화 데이터를 가져오는데 실패했습니다.");
    }

    const data = await response.json();
    return data.movies || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">최신 영화 목록</h1>
        <p className="text-sm text-gray-500">매일 자동으로 업데이트됩니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie: Movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
              <Image
                src={movie.poster_path || "/default-movie-image.jpg"}
                alt="영화 포스터"
                width={128}
                height={128}
                className="w-32 h-32 object-cover mb-2"
              />
              <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
              {movie.original_title && (
                <p className="text-gray-600 mb-2">{movie.original_title}</p>
              )}
              <p className="text-gray-700 mb-1">개봉일: {movie.release_date}</p>
              {movie.genres && (
                <p className="text-gray-700 mb-1">
                  장르: {movie.genres.join(", ")}
                </p>
              )}
              {movie.runtime && (
                <p className="text-gray-700 mb-1">
                  상영시간: {movie.runtime}분
                </p>
              )}
              {movie.vote_count && (
                <p className="text-gray-700">
                  누적 관객: {movie.vote_count.toLocaleString()}명
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {movies.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          저장된 영화가 없습니다.
        </p>
      )}
    </div>
  );
}
