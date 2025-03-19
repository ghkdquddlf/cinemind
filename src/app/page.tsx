import { MovieList } from "./(home)/components/dailyboxofficelist";
import { RandomMovies } from "./(home)/components/randomMovies";
import { AllMovies } from "./(home)/components/allMovies";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const metadata = {
  title: "CineMind - 홈",
  description: "최신 영화 정보와 다양한 생각을 공유하세요",
};

export const revalidate = 86400;

const BoxOfficeSkeleton = () => {
  return (
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div key={`skeleton-${index}`} className="flex-shrink-0 w-64">
              <div className="border rounded-lg p-4 shadow">
                <div className="relative aspect-[2/3] w-full">
                  <Skeleton height="100%" />
                </div>
                <div className="mt-2">
                  <Skeleton height={24} width="80%" className="mb-1" />
                  <Skeleton height={16} width="60%" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const GenreMoviesSkeleton = () => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <Skeleton height={32} width={150} />
        <div className="flex gap-2">
          <Skeleton height={32} width={50} count={3} inline />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="border rounded-lg p-4 shadow"
            >
              <div className="relative h-40 mb-2">
                <Skeleton height="100%" />
              </div>
              <Skeleton height={24} width="80%" className="mb-1" />
              <Skeleton height={16} width="60%" />
            </div>
          ))}
      </div>
    </div>
  );
};

const AllMoviesSkeleton = () => {
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <Skeleton height={32} width={150} />
        <Skeleton height={40} width={300} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="border rounded-lg p-4 shadow"
            >
              <div className="relative h-48 mb-3">
                <Skeleton height="100%" />
              </div>
              <Skeleton height={24} width="80%" className="mb-1" />
              <Skeleton height={16} width="60%" className="mb-1" />
              <Skeleton height={16} width="40%" className="mb-1" />
              <Skeleton height={16} width="50%" />
            </div>
          ))}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">일별 박스오피스</h1>
      <Suspense fallback={<BoxOfficeSkeleton />}>
        <MovieList />
      </Suspense>
      <div className="mt-8">
        <Suspense fallback={<GenreMoviesSkeleton />}>
          <RandomMovies />
        </Suspense>
      </div>
      <Suspense fallback={<AllMoviesSkeleton />}>
        <AllMovies />
      </Suspense>
    </main>
  );
}
