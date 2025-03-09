"use client";

import { TabType } from "../types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="border-b mb-6">
      <nav className="flex space-x-4">
        <button
          onClick={() => onTabChange("reviews")}
          className={`py-2 px-4 ${
            activeTab === "reviews"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          내 리뷰
        </button>
        <button
          onClick={() => onTabChange("replies")}
          className={`py-2 px-4 ${
            activeTab === "replies"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          내 답글
        </button>
        <button
          onClick={() => onTabChange("favorites")}
          className={`py-2 px-4 ${
            activeTab === "favorites"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          즐겨찾기
        </button>
        <button
          onClick={() => onTabChange("profile")}
          className={`py-2 px-4 ${
            activeTab === "profile"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          프로필 설정
        </button>
      </nav>
    </div>
  );
}
