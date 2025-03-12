import React from "react";
import { PageHeader } from "@/components/ui";

interface ReviewHeaderProps {
  error: string | null;
}

/**
 * 리뷰 관리 페이지의 헤더 컴포넌트
 */
export default function ReviewHeader({ error }: ReviewHeaderProps) {
  return (
    <PageHeader
      title="리뷰 관리"
      description={error ? undefined : "Supabase에서 리뷰 데이터를 가져옵니다."}
    />
  );
}
