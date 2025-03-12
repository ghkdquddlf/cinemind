import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";

/**
 * 사용자 프로필 정보를 가져오는 커스텀 훅
 * @returns 사용자 닉네임과 관련 상태
 */
export function useUserProfile() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // 이메일에서 기본 닉네임 추출 함수
  const getDefaultNickname = (email: string): string => {
    return email.includes("@") ? email.split("@")[0] : email;
  };

  // 사용자 ID로 프로필 정보 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("nickname")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("프로필 정보 조회 중 오류:", error);
        setError("프로필 정보를 가져오는 중 오류가 발생했습니다.");
        return null;
      }

      if (data?.nickname) {
        setNickname(data.nickname);
        return data.nickname;
      }

      return null;
    } catch (err) {
      console.error("프로필 정보를 가져오는 중 오류 발생:", err);
      setError("프로필 정보를 가져오는 중 오류가 발생했습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 현재 로그인한 사용자의 닉네임 가져오기
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setNickname(null);
      setLoading(false);
    }
  }, [user]);

  // 사용자 닉네임 가져오기 (이메일 기반 기본값 제공)
  const getUserNickname = (): string => {
    if (nickname) return nickname;
    if (user?.email) return getDefaultNickname(user.email);
    return "익명 사용자";
  };

  return {
    nickname,
    loading,
    error,
    fetchUserProfile,
    getUserNickname,
  };
}
