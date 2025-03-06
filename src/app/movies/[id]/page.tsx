// src/app/movies/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Movie } from "@/types/movie";
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from "@/lib/favorites";
import MovieInfo from "./components/MovieInfo";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");

  const [favorite, setFavorite] = useState(false);

  const fetchMovieAndReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const movieResponse = await fetch(`/api/movies/${movieId}`);
      const movieData = await movieResponse.json();

      if (!movieResponse.ok) {
        throw new Error(
          movieData.error || "영화 정보를 가져오는데 실패했습니다."
        );
      }

      setMovie(movieData.movie);

      const reviewsResponse = await fetch(`/api/movies/${movieId}/reviews`);
      const reviewsData = await reviewsResponse.json();

      if (!reviewsResponse.ok) {
        throw new Error(reviewsData.error || "리뷰를 가져오는데 실패했습니다.");
      }

      setReviews(reviewsData.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const isMovieFavorite = await isFavorite(movieId);
      setFavorite(isMovieFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieAndReviews();
    checkFavoriteStatus();
  }, [fetchMovieAndReviews, checkFavoriteStatus]);

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      if (favorite) {
        await removeFromFavorites(movieId);
        setFavorite(false);
      } else {
        await addToFavorites(movieId);
        setFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author,
          content,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "리뷰 작성에 실패했습니다.");
      }

      setAuthor("");
      setContent("");
      setPassword("");

      fetchMovieAndReviews();

      alert("리뷰가 등록되었습니다.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "리뷰 작성 중 오류가 발생했습니다."
      );
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!movie) return <div className="p-4">영화를 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto p-4">
      <MovieInfo
        movie={movie}
        favorite={favorite}
        loading={loading}
        onToggleFavorite={toggleFavorite}
      />
      <ReviewForm
        author={author}
        content={content}
        password={password}
        onAuthorChange={setAuthor}
        onContentChange={setContent}
        onPasswordChange={setPassword}
        onSubmit={handleSubmitReview}
      />
      <ReviewList
        reviews={reviews}
        movieId={movieId}
        onReviewDeleted={fetchMovieAndReviews}
      />
    </div>
  );
}
