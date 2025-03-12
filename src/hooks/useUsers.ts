import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, UserProfile } from "@/types";

/**
 * 사용자 데이터를 가져오는 커스텀 훅
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // 이메일에서 기본 닉네임 추출 함수
  const getDefaultNickname = (email: string): string => {
    return email.includes("@") ? email.split("@")[0] : email;
  };

  // 사용자 데이터 가져오기
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("사용자 정보 가져오기 오류:", userError);
        throw userError;
      }

      if (user) {
        const email = user.email || "이메일 없음";
        const userId = user.id;

        // user_profiles 테이블에서 닉네임 정보 가져오기 시도
        let nickname = getDefaultNickname(email);

        try {
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (profileError) {
            console.error("사용자 프로필 가져오기 오류:", profileError);
          } else if (profileData && profileData.nickname) {
            const userProfile = profileData as UserProfile;
            nickname = userProfile.nickname || getDefaultNickname(email);
            console.log("프로필에서 가져온 닉네임:", nickname);
          }
        } catch (profileErr) {
          console.error("프로필 데이터 가져오기 실패:", profileErr);
        }

        // 현재 로그인한 사용자 정보만 표시
        const currentUser: User = {
          id: userId,
          email: email,
          nickname: nickname,
          created_at: user.created_at || new Date().toISOString(),
          last_sign_in_at: user.last_sign_in_at || null,
        };

        setUsers([currentUser]);
        setFilteredUsers([currentUser]);
        console.log("현재 로그인한 사용자:", currentUser);
      } else {
        // 로그인한 사용자가 없으면 빈 배열 설정
        console.log("로그인한 사용자가 없습니다.");
        setUsers([]);
        setFilteredUsers([]);
        setError("로그인한 사용자가 없습니다.");
      }
    } catch (err) {
      console.error("사용자 데이터 가져오기 오류:", err);
      setError("사용자 데이터를 가져오는 중 오류가 발생했습니다.");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 검색 기능
  const searchUsers = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredUsers(users);
        return;
      }

      const lowerCaseQuery = query.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.nickname.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredUsers(filtered);
    },
    [users]
  );

  // 날짜 포맷팅 함수
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return "없음";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    formatDate,
    searchUsers,
    searchQuery,
  };
}
