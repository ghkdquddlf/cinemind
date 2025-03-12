import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * 페이지 제목과 설명을 표시하는 컴포넌트
 */
export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      {description && <p className="text-gray-500 mt-2">{description}</p>}
    </div>
  );
}
