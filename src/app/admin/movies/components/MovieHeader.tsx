import React from "react";
import { PageHeader } from "@/components/ui";

interface MovieHeaderProps {
  error: string | null;
}

/**
 * 영화 관리 페이지 헤더 컴포넌트
 */
export default function MovieHeader({ error }: MovieHeaderProps) {
  return (
    <PageHeader
      title="영화 관리"
      description={error ? undefined : "Supabase에서 영화 데이터를 가져옵니다."}
    />
  );
}
