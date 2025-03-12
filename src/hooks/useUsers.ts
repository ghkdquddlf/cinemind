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

      // Supabase Auth에서 모든 사용자 가져오기
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers();

      if (authError) {
        // 관리자 API 접근 권한이 없는 경우 일반 사용자 목록 가져오기 시도
        console.error("관리자 API 접근 오류:", authError);

        // 대체 방법: user_profiles 테이블에서 사용자 정보 가져오기
        const { data: profilesData, error: profilesError } = await supabase
          .from("user_profiles")
          .select("*");

        if (profilesError) {
          throw new Error(
            "사용자 프로필 데이터를 가져오는 중 오류가 발생했습니다."
          );
        }

        if (profilesData && profilesData.length > 0) {
          const formattedUsers: User[] = profilesData.map((profile) => ({
            id: profile.user_id,
            email: profile.email || "이메일 없음",
            nickname:
              profile.nickname || getDefaultNickname(profile.email || ""),
            created_at: profile.created_at || new Date().toISOString(),
            last_sign_in_at: null,
          }));

          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
        } else {
          // 현재 로그인한 사용자 정보만 가져오기
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const email = user.email || "이메일 없음";
            const currentUser: User = {
              id: user.id,
              email: email,
              nickname: getDefaultNickname(email),
              created_at: user.created_at || new Date().toISOString(),
              last_sign_in_at: user.last_sign_in_at || null,
            };

            setUsers([currentUser]);
            setFilteredUsers([currentUser]);
          } else {
            setUsers([]);
            setFilteredUsers([]);
            setError("사용자 데이터를 가져올 수 없습니다.");
          }
        }
      } else if (authUsers) {
        // 관리자 API로 가져온 사용자 목록 처리
        const userProfiles: Record<string, UserProfile> = {};

        // 사용자 프로필 정보 가져오기
        try {
          const { data: profilesData } = await supabase
            .from("user_profiles")
            .select("*");

          if (profilesData && profilesData.length > 0) {
            profilesData.forEach((profile) => {
              userProfiles[profile.user_id] = profile;
            });
          }
        } catch (profileErr) {
          console.error("프로필 데이터 가져오기 실패:", profileErr);
        }

        // 사용자 목록 형식 변환
        const formattedUsers: User[] = authUsers.users.map((authUser) => {
          const email = authUser.email || "이메일 없음";
          const profile = userProfiles[authUser.id];
          const nickname = profile?.nickname || getDefaultNickname(email);

          return {
            id: authUser.id,
            email: email,
            nickname: nickname,
            created_at: authUser.created_at || new Date().toISOString(),
            last_sign_in_at: authUser.last_sign_in_at || null,
          };
        });

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } else {
        setUsers([]);
        setFilteredUsers([]);
        setError("사용자 데이터를 가져올 수 없습니다.");
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
          (user.nickname &&
            user.nickname.toLowerCase().includes(lowerCaseQuery)) ||
          (user.email && user.email.toLowerCase().includes(lowerCaseQuery))
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
