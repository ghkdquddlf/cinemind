"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("로그인 성공:", data);
      setSuccess(true);

      // URL에서 redirect 파라미터 확인
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get("redirect") || "/";

      // 세션 설정을 위한 짧은 지연
      setTimeout(() => {
        // 페이지 새로고침 후 리디렉션 (세션 쿠키가 제대로 설정되도록)
        window.location.href = redirectPath;
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-500 p-4 rounded-md">
              로그인 성공! 잠시 후 리디렉션됩니다...
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="이메일"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="비밀번호"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "로그인 중..." : success ? "로그인 성공!" : "로그인"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              계정이 없으신가요? 회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
