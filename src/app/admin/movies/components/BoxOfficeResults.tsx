"use client";

import { BoxOfficeResult } from "../types";

interface BoxOfficeResultsProps {
  results: BoxOfficeResult[];
}

export default function BoxOfficeResults({ results }: BoxOfficeResultsProps) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">처리 결과</h3>
      <div className="max-h-60 overflow-y-auto border rounded p-2 bg-white">
        <ul className="divide-y">
          {results.map((result, index) => (
            <li key={index} className="py-2">
              <span className="font-medium">{result.title}</span>
              {result.type === "조회만 함" ? (
                <span className="text-blue-500 ml-2">
                  ℹ️ 조회만 함 (순위: {result.rank})
                </span>
              ) : result.success ? (
                <span className="text-green-500 ml-2">✓ 저장 성공</span>
              ) : (
                <span className="text-red-500 ml-2">
                  ✗ 저장 실패: {result.error}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
