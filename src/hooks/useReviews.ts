import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Review, UserProfile } from "@/types";

/**
 * 리뷰 데이터를 가져오는 커스텀 훅
 */
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // 리뷰 데이터 가져오기
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 리뷰 데이터만 가져오기
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("리뷰 데이터 가져오기 오류:", reviewsError);
        throw reviewsError;
      }

      if (reviewsData && reviewsData.length > 0) {
        console.log("Supabase에서 가져온 리뷰 데이터:", reviewsData);

        // 영화 정보 가져오기
        const movieIds = [
          ...new Set(reviewsData.map((review) => review.movie_id)),
        ];
        const { data: moviesData, error: moviesError } = await supabase
          .from("movies")
          .select("id, title")
          .in("id", movieIds);

        if (moviesError) {
          console.error("영화 데이터 가져오기 오류:", moviesError);
        }

        // 사용자 정보 가져오기 시도 (user_profiles 테이블)
        const userIds = [
          ...new Set(reviewsData.map((review) => review.user_id)),
        ];
        let userProfiles: Record<string, UserProfile> = {};

        try {
          // user_profiles 테이블에서 사용자 정보 가져오기 시도
          const { data: profilesData, error: profilesError } = await supabase
            .from("user_profiles")
            .select("*")
            .in("user_id", userIds);

          if (profilesError) {
            console.error("사용자 프로필 데이터 가져오기 오류:", profilesError);
          } else if (profilesData && profilesData.length > 0) {
            // 사용자 ID를 키로 하는 맵 생성
            userProfiles = profilesData.reduce((acc, profile) => {
              acc[profile.user_id] = profile;
              return acc;
            }, {} as Record<string, UserProfile>);

            console.log(
              "Supabase에서 가져온 사용자 프로필 데이터:",
              profilesData
            );
          }
        } catch (profileErr) {
          console.error("사용자 프로필 데이터 가져오기 실패:", profileErr);
        }

        // 영화 ID를 키로 하는 맵 생성
        const movieMap = (moviesData || []).reduce((acc, movie) => {
          acc[movie.id] = movie.title;
          return acc;
        }, {} as Record<string, string>);

        // 사용자 ID를 닉네임으로 변환하는 함수
        const getUserNickname = (userId: string) => {
          // 사용자 프로필 정보가 있으면 닉네임 또는 이메일 사용
          if (userProfiles[userId]) {
            if (userProfiles[userId].nickname) {
              return userProfiles[userId].nickname;
            }
            if (userProfiles[userId].email) {
              // 이메일이 있으면 @ 앞부분만 사용
              const email = userProfiles[userId].email;
              return email.includes("@") ? email.split("@")[0] : email;
            }
          }

          // 이메일 형식이면 @ 앞부분만 사용
          if (userId.includes("@")) {
            return userId.split("@")[0];
          }

          // 사용자 ID의 첫 4자리를 사용하여 닉네임 생성
          const shortId = userId.substring(0, 4);
          return `사용자_${shortId}`;
        };

        // 사용자 이메일 정보는 닉네임 형식으로 표시
        const formattedReviews = reviewsData.map((review) => ({
          id: review.id,
          user_id: review.user_id,
          movie_id: review.movie_id,
          content: review.content || "내용 없음",
          rating: review.rating || 0,
          created_at: review.created_at,
          user_email: getUserNickname(review.user_id), // 사용자 ID를 닉네임으로 변환
          movie_title: movieMap[review.movie_id] || "알 수 없는 영화",
        }));

        setReviews(formattedReviews);
        setFilteredReviews(formattedReviews);
      } else {
        // 데이터가 없으면 빈 배열 설정
        setReviews([]);
        setFilteredReviews([]);
        console.log("Supabase에서 가져온 리뷰 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("리뷰 데이터 가져오기 오류:", err);
      setError("리뷰 데이터를 가져오는 중 오류가 발생했습니다.");

      // 오류 발생 시 빈 배열 설정
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 검색 기능
  const searchReviews = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredReviews(reviews);
        return;
      }

      const lowerCaseQuery = query.toLowerCase();
      const filtered = reviews.filter(
        (review) =>
          (review.movie_title &&
            review.movie_title.toLowerCase().includes(lowerCaseQuery)) ||
          (review.user_email &&
            review.user_email.toLowerCase().includes(lowerCaseQuery)) ||
          (review.content &&
            review.content.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredReviews(filtered);
    },
    [reviews]
  );

  // 날짜 포맷팅 함수
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // 별점 렌더링 함수
  const renderStars = useCallback((rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }, []);

  // 리뷰 삭제 함수
  const deleteReview = useCallback(
    async (id: string) => {
      if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
        return;
      }

      try {
        setLoading(true);

        // Supabase에서 리뷰 삭제
        const { error } = await supabase.from("reviews").delete().eq("id", id);

        if (error) {
          throw error;
        }

        // 성공적으로 삭제되면 UI에서도 제거
        const updatedReviews = reviews.filter((review) => review.id !== id);
        setReviews(updatedReviews);
        setFilteredReviews(
          filteredReviews.filter((review) => review.id !== id)
        );
        alert("리뷰가 삭제되었습니다.");
      } catch (err) {
        console.error("리뷰 삭제 오류:", err);
        alert("리뷰 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [reviews, filteredReviews, supabase]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews: filteredReviews,
    allReviews: reviews,
    loading,
    error,
    formatDate,
    renderStars,
    deleteReview,
    searchReviews,
    searchQuery,
  };
}
