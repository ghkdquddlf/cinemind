"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { TabType, Review, Reply, FavoriteItem } from "./types";
import TabNavigation from "./components/TabNavigation";
import ReviewsTab from "./components/ReviewsTab";
import RepliesTab from "./components/RepliesTab";
import FavoritesTab from "./components/FavoritesTab";
import ProfileTab from "./components/ProfileTab";

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("reviews");
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [myReplies, setMyReplies] = useState<Reply[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<FavoriteItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");

  // 사용자 닉네임 가져오기
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("nickname")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("프로필 정보 조회 중 오류:", error);
        return;
      }

      if (data?.nickname) {
        setNickname(data.nickname);
      }
    } catch (err) {
      console.error("프로필 정보를 가져오는 중 오류 발생:", err);
    }
  };

  // 내 리뷰 가져오기
  const fetchMyReviews = async () => {
    if (!user) return;

    setLoadingData(true);
    setError(null);

    try {
      const supabase = createClient();

      console.log("사용자 정보:", { id: user.id, email: user.email });

      // user_id로 조회 시도 - 외래 키 관계 없이 기본 필드만 조회
      const { data: idData, error: idError } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (idError) {
        console.error("user_id로 조회 중 오류:", idError);
      } else {
        console.log("user_id로 조회한 결과:", idData);

        // 영화 정별도 조회
        if (idData && idData.length > 0) {
          const movieIds = idData.map((review) => review.movie_id);
          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in("id", movieIds);

          if (moviesError) {
            console.error("리뷰 관련 영화 정보 조회 중 오류:", moviesError);
          } else {
            // 리뷰 데이터에 영화 정보 추가
            idData.forEach((review) => {
              const movie = moviesData?.find((m) => m.id === review.movie_id);
              if (movie) {
                review.movies = movie;
              }
            });
          }
        }
      }

      // author(이메일)로 조회 시도 - 외래 키 관계 없이 기본 필드만 조회
      const { data: authorData, error: authorError } = await supabase
        .from("reviews")
        .select("*")
        .eq("author", user.email)
        .order("created_at", { ascending: false });

      if (authorError) {
        console.error("author로 조회 중 오류:", authorError);
      } else {
        console.log("author로 조회한 결과:", authorData);

        // 영화 정별도 조회
        if (authorData && authorData.length > 0) {
          const movieIds = authorData.map((review) => review.movie_id);
          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in("id", movieIds);

          if (moviesError) {
            console.error("리뷰 관련 영화 정보 조회 중 오류:", moviesError);
          } else {
            // 리뷰 데이터에 영화 정보 추가
            authorData.forEach((review) => {
              const movie = moviesData?.find((m) => m.id === review.movie_id);
              if (movie) {
                review.movies = movie;
              }
            });
          }
        }
      }

      if (idError && authorError) {
        throw new Error(
          `ID 조회 오류: ${JSON.stringify(
            idError
          )}, 이메일 조회 오류: ${JSON.stringify(authorError)}`
        );
      }

      // 두 결과 병합 (중복 제거)
      const combinedData = [...(idData || [])];

      // authorData에서 id가 combinedData에 없는 항목만 추가
      if (authorData) {
        authorData.forEach((review) => {
          if (!combinedData.some((r) => r.id === review.id)) {
            combinedData.push(review);
          }
        });
      }

      setMyReviews(combinedData);
      console.log("최종 병합된 리뷰 데이터:", combinedData);
    } catch (err) {
      console.error("리뷰를 가져오는 중 오류 발생:", err);
      if (err instanceof Error) {
        console.error("오류 메시지:", err.message);
      } else {
        console.error("오류 상세 정보:", JSON.stringify(err));
      }
      setError("리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoadingData(false);
    }
  };

  // 내 답글 가져오기
  const fetchMyReplies = async () => {
    if (!user) return;

    setLoadingData(true);
    setError(null);

    try {
      const supabase = createClient();

      console.log("답글 조회 - 사용자 정보:", {
        id: user.id,
        email: user.email,
      });

      // user_id로 조회 시도 - 외래 키 관계 없이 기본 필드만 조회
      const { data: idData, error: idError } = await supabase
        .from("review_replies")
        .select("*")
        .eq("user_id", user.id);

      if (idError) {
        console.error("user_id로 답글 조회 중 오류:", idError);
      } else {
        console.log("user_id로 조회한 답글 결과:", idData);

        // 리뷰 정보 별도 조회
        if (idData && idData.length > 0) {
          const reviewIds = idData.map((reply) => reply.review_id);
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*")
            .in("id", reviewIds);

          if (reviewsError) {
            console.error("답글 관련 리뷰 정보 조회 중 오류:", reviewsError);
          } else {
            // 답글 데이터에 리뷰 정보 추가
            idData.forEach((reply) => {
              const review = reviewsData?.find((r) => r.id === reply.review_id);
              if (review) {
                reply.reviews = review;
              }
            });
          }
        }
      }

      // author(이메일)로 조회 시도 - 외래 키 관계 없이 기본 필드만 조회
      const { data: authorData, error: authorError } = await supabase
        .from("review_replies")
        .select("*")
        .eq("author", user.email);

      if (authorError) {
        console.error("author로 답글 조회 중 오류:", authorError);
      } else {
        console.log("author로 조회한 답글 결과:", authorData);

        // 리뷰 정보 별도 조회
        if (authorData && authorData.length > 0) {
          const reviewIds = authorData.map((reply) => reply.review_id);
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*")
            .in("id", reviewIds);

          if (reviewsError) {
            console.error("답글 관련 리뷰 정보 조회 중 오류:", reviewsError);
          } else {
            // 답글 데이터에 리뷰 정보 추가
            authorData.forEach((reply) => {
              const review = reviewsData?.find((r) => r.id === reply.review_id);
              if (review) {
                reply.reviews = review;
              }
            });
          }
        }
      }

      if (idError && authorError) {
        throw new Error(
          `ID 조회 오류: ${JSON.stringify(
            idError
          )}, 이메일 조회 오류: ${JSON.stringify(authorError)}`
        );
      }

      // 두 결과 병합 (중복 제거)
      const combinedData = [...(idData || [])];

      // authorData에서 id가 combinedData에 없는 항목만 추가
      if (authorData) {
        authorData.forEach((reply) => {
          if (!combinedData.some((r) => r.id === reply.id)) {
            combinedData.push(reply);
          }
        });
      }

      setMyReplies(combinedData);
      console.log("최종 병합된 답글 데이터:", combinedData);
    } catch (err) {
      console.error("내 답글을 가져오는 중 오류 발생:", err);
      if (err instanceof Error) {
        console.error("오류 메시지:", err.message);
      } else {
        console.error("오류 상세 정보:", JSON.stringify(err));
      }
      setError("답글을 불러오는데 실패했습니다.");
    } finally {
      setLoadingData(false);
    }
  };

  // 즐겨찾기 영화 가져오기
  const fetchFavoriteMovies = async () => {
    if (!user) return;

    setLoadingData(true);
    setError(null);

    try {
      const supabase = createClient();

      console.log("즐겨찾기 조회 - 사용자 정보:", {
        id: user.id,
        email: user.email,
      });

      // 먼저 favorites 테이블이 존재하는지 확인
      const { error: tableCheckError } = await supabase
        .from("favorites")
        .select("id")
        .limit(1);

      if (tableCheckError) {
        console.error("favorites 테이블 확인 중 오류:", tableCheckError);

        // 테이블이 없는 경우 로컬스토리지에서 가져오기 시도
        try {
          const favorites = JSON.parse(
            localStorage.getItem("favorites") || "[]"
          );
          console.log("로컬스토리지에서 가져온 즐겨찾기:", favorites);

          if (favorites.length === 0) {
            setFavoriteMovies([]);
            return [];
          }

          // 유효한 ID만 필터링
          const validFavorites = favorites.filter(
            (id: string | unknown) => id && typeof id === "string"
          );

          if (validFavorites.length === 0) {
            console.log("유효한 즐겨찾기 ID가 없습니다.");
            setFavoriteMovies([]);
            return [];
          }

          // 영화 ID로 영화 정보 가져오기
          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in("id", validFavorites);

          if (moviesError) {
            console.error("즐겨찾기 영화 정보 조회 중 오류:", moviesError);
            return [];
          }

          console.log("로컬스토리지 기반 즐겨찾기 영화:", moviesData);
          setFavoriteMovies(moviesData || []);
          return moviesData || [];
        } catch (localError) {
          console.error("로컬스토리지 즐겨찾기 처리 중 오류:", localError);
          return [];
        }
      }

      // user_id로 조회 시도 - 외래 키 관계 없이 기본 필드만 조회
      const { data: idData, error: idError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);

      if (idError) {
        console.error("user_id로 즐겨찾기 조회 중 오류:", idError);
      } else {
        console.log("user_id로 조회한 즐겨찾기 결과:", idData);

        // 영화 정별도 조회
        if (idData && idData.length > 0) {
          const movieIds = idData
            .map((favorite) => favorite.movie_id)
            .filter(Boolean);

          // movieIds가 비어있는 경우 처리
          if (movieIds.length === 0) {
            console.log("유효한 영화 ID가 없습니다.");
            setFavoriteMovies([]);
            return [];
          }

          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in("id", movieIds);

          if (moviesError) {
            console.error("즐겨찾기 관련 영화 정보 조회 중 오류:", moviesError);
          } else {
            console.log("조회된 영화 데이터:", moviesData);

            // 즐겨찾기 데이터에 영화 정보 추가
            idData.forEach((favorite) => {
              const movie = moviesData?.find((m) => m.id === favorite.movie_id);
              if (movie) {
                favorite.movies = movie;
              }
            });
          }
        }
      }

      if (idError) {
        throw new Error(`ID 조회 오류: ${JSON.stringify(idError)}`);
      }

      // 결과 설정
      const combinedData = [...(idData || [])];

      setFavoriteMovies(combinedData);
      console.log("최종 병합된 즐겨찾기 데이터:", combinedData);

      // 데이터 구조 자세히 확인
      if (combinedData.length > 0) {
        console.log(
          "첫 번째 즐겨찾기 항목 상세 정보:",
          JSON.stringify(combinedData[0], null, 2)
        );
        console.log("영화 정보 확인:", combinedData[0].movies);
        if (combinedData[0].movies) {
          console.log("영화 설명 필드:", {
            description: combinedData[0].movies.description,
            hasDescription: !!combinedData[0].movies.description,
          });
        }
      }

      return combinedData;
    } catch (err) {
      console.error("즐겨찾기 영화를 불러오는 중 오류가 발생했습니다:", err);
      if (err instanceof Error) {
        console.error("오류 메시지:", err.message);
      } else {
        console.error("오류 상세 정보:", JSON.stringify(err));
      }
      return [];
    } finally {
      setLoadingData(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (activeTab === "reviews") {
      fetchMyReviews();
    } else if (activeTab === "replies") {
      fetchMyReplies();
    } else if (activeTab === "favorites") {
      fetchFavoriteMovies();
    } else if (activeTab === "profile") {
      fetchUserProfile();
    }
  }, [activeTab, isAuthenticated, user]);

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        throw error;
      }

      // 리뷰 목록 갱신
      fetchMyReviews();
      alert("리뷰가 삭제되었습니다.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "리뷰 삭제 중 오류가 발생했습니다."
      );
    }
  };

  // 답글 삭제 핸들러
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("정말로 이 답글을 삭제하시겠습니까?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("review_replies")
        .delete()
        .eq("id", replyId);

      if (error) {
        throw error;
      }

      // 답글 목록 갱신
      fetchMyReplies();
      alert("답글이 삭제되었습니다.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "답글 삭제 중 오류가 발생했습니다."
      );
    }
  };

  // 즐겨찾기 삭제 핸들러
  const handleRemoveFavorite = (movieId: string) => {
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const updatedFavorites = favorites.filter((id: string) => id !== movieId);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      // 즐겨찾기 목록 갱신
      fetchFavoriteMovies();
      alert("즐겨찾기에서 삭제되었습니다.");
    } catch (err) {
      console.error("즐겨찾기 삭제 중 오류:", err);
      alert("즐겨찾기에서 삭제하는 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중이거나 인증되지 않은 경우
  if (loading || (!isAuthenticated && !loading)) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          {loading ? (
            <div className="w-full max-w-md mx-auto">
              <Skeleton height={40} width="60%" className="mb-4 mx-auto" />
              <Skeleton height={20} width="80%" className="mb-2 mx-auto" />
              <Skeleton height={20} width="70%" className="mb-4 mx-auto" />
              <Skeleton height={40} width={120} className="mx-auto" />
            </div>
          ) : (
            <div>
              <p className="text-xl mb-4">로그인이 필요한 페이지입니다.</p>
              <Link
                href="/auth/login?redirect=/mypage"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                로그인하러 가기
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* 사용자 정보 요약 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.email}</h2>
            <p className="text-gray-500">
              가입일: {new Date(user?.created_at || "").toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      {/* 탭 내용 */}
      <div className="mt-6">
        {/* 내 리뷰 탭 */}
        {activeTab === "reviews" && (
          <ReviewsTab
            reviews={myReviews}
            loading={loadingData}
            error={error}
            onDeleteReview={handleDeleteReview}
          />
        )}

        {/* 내 답글 탭 */}
        {activeTab === "replies" && (
          <RepliesTab
            replies={myReplies}
            loading={loadingData}
            error={error}
            onDeleteReply={handleDeleteReply}
          />
        )}

        {/* 즐겨찾기 탭 */}
        {activeTab === "favorites" && (
          <FavoritesTab
            favorites={favoriteMovies}
            loading={loadingData}
            error={error}
            onRemoveFavorite={handleRemoveFavorite}
          />
        )}

        {/* 프로필 설정 탭 */}
        {activeTab === "profile" && (
          <ProfileTab user={user} initialNickname={nickname} />
        )}
      </div>
    </div>
  );
}
