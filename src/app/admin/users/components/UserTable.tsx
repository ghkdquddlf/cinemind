import React from "react";
import { Column, DataTable } from "@/components/ui";
import { User } from "@/types";

interface UserTableProps {
  users: User[];
  formatDate: (dateString: string | null) => string;
}

/**
 * 사용자 목록을 표시하는 테이블 컴포넌트
 */
export default function UserTable({ users, formatDate }: UserTableProps) {
  // 테이블 컬럼 정의
  const columns: Column<User>[] = [
    {
      header: "닉네임",
      accessor: "nickname",
      className: "font-medium text-gray-900",
    },
    {
      header: "이메일",
      accessor: "email",
    },
    {
      header: "가입일",
      accessor: (user) => formatDate(user.created_at),
    },
    {
      header: "마지막 로그인",
      accessor: (user) => formatDate(user.last_sign_in_at),
    },
    {
      header: "관리",
      accessor: () => (
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => alert("사용자 삭제 기능은 아직 구현되지 않았습니다.")}
        >
          삭제
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      keyField="id"
      emptyMessage="등록된 사용자가 없습니다."
    />
  );
}
