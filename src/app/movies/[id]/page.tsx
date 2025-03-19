// src/app/movies/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import MovieInfo from "./components/MovieInfo";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// 페이지 메타데이터 동적 생성
export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!movie) {
    return {
      title: "영화를 찾을 수 없음",
      description: "요청하신 영화를 찾을 수 없습니다.",
    };
  }

  return {
    title: `${movie.title} - CineMind`,
    description: movie.overview
      ? movie.overview.substring(0, 160)
      : "영화 상세 정보 및 리뷰를 확인하세요.",
  };
}

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: movies } = await supabase
    .from("movies")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(20);

  return (movies || []).map((movie: { id: number | string }) => ({
    id: movie.id.toString(),
  }));
}

export const revalidate = 86400;

// 영화 정보 스켈레톤 컴포넌트
const MovieInfoSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="relative aspect-[2/3] w-full">
            <Skeleton height="100%" />
          </div>
        </div>
        <div className="md:w-2/3">
          <Skeleton height={36} width="70%" className="mb-4" />
          <Skeleton height={24} width="50%" className="mb-3" />
          <Skeleton height={20} width="30%" className="mb-2" />
          <Skeleton height={20} width="40%" className="mb-2" />
          <Skeleton height={20} width="35%" className="mb-4" />
          <Skeleton height={100} className="mb-4" />
          <Skeleton height={20} width="60%" className="mb-2" />
          <Skeleton height={20} width="50%" className="mb-2" />
        </div>
      </div>
    </div>
  );
};

// 리뷰 폼 스켈레톤 컴포넌트
const ReviewFormSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <Skeleton height={32} width="30%" className="mb-4" />
      <Skeleton height={100} className="mb-4" />
      <Skeleton height={40} width="20%" />
    </div>
  );
};

// 리뷰 목록 스켈레톤 컴포넌트
const ReviewListSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <Skeleton height={32} width="30%" className="mb-4" />
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="mb-6 pb-6 border-b last:border-0">
            <Skeleton height={24} width="40%" className="mb-2" />
            <Skeleton height={16} width="20%" className="mb-3" />
            <Skeleton height={60} className="mb-2" />
            <Skeleton height={16} width="15%" />
          </div>
        ))}
    </div>
  );
};

export default async function MoviePage({
  params,
}: {
  params: { id: string };
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: movie, error } = await supabase
    .from("movies")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !movie) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<MovieInfoSkeleton />}>
        <MovieInfo movie={movie} />
      </Suspense>

      <Suspense fallback={<ReviewFormSkeleton />}>
        <ReviewForm movieId={params.id} />
      </Suspense>

      <Suspense fallback={<ReviewListSkeleton />}>
        <ReviewList movieId={params.id} />
      </Suspense>
    </div>
  );
}
