import React, { ReactNode } from "react";
import EmptyState from "./EmptyState";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  emptyMessage?: string;
  className?: string;
}

/**
 * 재사용 가능한 데이터 테이블 컴포넌트
 */
export default function DataTable<T>({
  data,
  columns,
  keyField,
  emptyMessage = "데이터가 없습니다.",
  className = "",
}: DataTableProps<T>) {
  if (!data.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div
      className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={String(item[keyField])} className="hover:bg-gray-50">
              {columns.map((column, index) => {
                const cellContent =
                  typeof column.accessor === "function"
                    ? column.accessor(item)
                    : item[column.accessor];

                return (
                  <td
                    key={index}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.className || "text-gray-500"
                    }`}
                  >
                    {cellContent as ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
