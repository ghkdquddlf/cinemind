import React from "react";
import { PageHeader } from "@/components/ui";

interface UserHeaderProps {
  error: string | null;
}

/**
 * 사용자 관리 페이지의 헤더 컴포넌트
 */
export default function UserHeader({ error }: UserHeaderProps) {
  return (
    <PageHeader
      title="사용자 관리"
      description={
        error
          ? undefined
          : "Supabase Authentication에서 사용자 데이터를 가져옵니다."
      }
    />
  );
}
