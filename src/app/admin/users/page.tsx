"use client";

import { ErrorMessage, Loading, SearchBar } from "@/components/ui";
import { useUsers } from "@/hooks";
import UserHeader from "./components/UserHeader";
import UserTable from "./components/UserTable";

/**
 * 사용자 관리 페이지
 */
export default function AdminUsersPage() {
  const { users, loading, error, formatDate, searchUsers } = useUsers();

  return (
    <div className="container mx-auto p-4">
      <UserHeader error={error} />

      <SearchBar
        placeholder="닉네임 또는 이메일로 검색"
        onSearch={searchUsers}
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="사용자 데이터를 불러오는 중..." />
      ) : (
        <UserTable users={users} formatDate={formatDate} />
      )}
    </div>
  );
}
