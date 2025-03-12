import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 쿠키 설정 중 오류 발생 시 로깅
            console.error(`Error setting cookie ${name}:`, error);
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // 쿠키 제거 중 오류 발생 시 로깅
            console.error(`Error removing cookie ${name}:`, error);
          }
        },
      },
    }
  );
}
