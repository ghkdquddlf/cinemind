import React, { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
  className?: string;
}

/**
 * 재사용 가능한 검색 컴포넌트
 */
export function SearchBar({
  placeholder = "검색어를 입력하세요",
  onSearch,
  initialValue = "",
  className = "",
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  // 초기값이 변경되면 검색어 상태 업데이트
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  // 검색어 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  // 검색 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-4 ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
