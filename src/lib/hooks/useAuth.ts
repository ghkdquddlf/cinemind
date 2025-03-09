import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 현재 로그인된 사용자 정보 가져오기
    const getUser = async () => {
      try {
        setLoading(true);

        // 세션 확인
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("Current session:", sessionData);

        if (!sessionData.session) {
          console.log("No active session found");
          setUser(null);
          setLoading(false);
          return;
        }

        // 사용자 정보 가져오기
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          setUser(null);
        } else {
          console.log("Authenticated user:", user);
          setUser(user);
        }
      } catch (error) {
        console.error("Error in useAuth hook:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // 초기 사용자 정보 가져오기
    getUser();

    // 인증 상태 변경 이벤트 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, isAuthenticated: !!user };
}
