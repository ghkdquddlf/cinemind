"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface ProfileTabProps {
  user: User | null;
  initialNickname?: string;
}

export default function ProfileTab({
  user,
  initialNickname = "",
}: ProfileTabProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>(initialNickname);
  const [savingNickname, setSavingNickname] = useState(false);
  const [nicknameSuccess, setNicknameSuccess] = useState(false);

  // 사용자 닉네임 저장
  const saveNickname = async () => {
    if (!user) return;
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    setSavingNickname(true);
    setNicknameSuccess(false);

    try {
      const supabase = createClient();

      // user_profiles 테이블이 있는지 확인
      const { error: tableCheckError } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1);

      // 테이블이 없으면 생성 (실제로는 마이그레이션 스크립트로 처리해야 함)
      if (tableCheckError) {
        console.log("user_profiles 테이블이 없습니다. 생성을 시도합니다.");
        // 여기서는 테이블 생성 로직을 구현하지 않습니다.
      }

      // upsert 방식으로 저장 (없으면 생성, 있으면 업데이트)
      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          nickname: nickname.trim(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        throw error;
      }

      setNicknameSuccess(true);
      setTimeout(() => setNicknameSuccess(false), 3000);
    } catch (err) {
      console.error("닉네임 저장 중 오류 발생:", err);
      alert("닉네임 저장에 실패했습니다.");
    } finally {
      setSavingNickname(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">프로필 설정</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">기본 정보</h3>
          <p className="text-gray-600 mb-1">이메일: {user?.email}</p>
          <p className="text-gray-600">
            가입일: {new Date(user?.created_at || "").toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">닉네임 설정</h3>
          <p className="text-gray-600 mb-4">
            닉네임을 설정하면 리뷰와 답글 작성 시 이메일 대신 닉네임이
            표시됩니다.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="border rounded px-3 py-2 flex-grow"
              maxLength={20}
            />
            <button
              onClick={saveNickname}
              disabled={savingNickname}
              className={`px-4 py-2 rounded ${
                savingNickname ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {savingNickname ? "저장 중..." : "저장"}
            </button>
          </div>
          {nicknameSuccess && (
            <p className="text-green-500 mt-2">
              닉네임이 성공적으로 저장되었습니다.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">계정 관리</h3>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
