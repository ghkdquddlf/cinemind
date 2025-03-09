/**
 * 어제 날짜를 YYYY-MM-DD 형식으로 반환하는 함수
 * @returns {string} YYYY-MM-DD 형식의 어제 날짜
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

/**
 * 날짜 형식을 YYYYMMDD로 변환하는 함수
 * @param {string} dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} YYYYMMDD 형식의 날짜 문자열
 */
export function formatDateForApi(dateString: string): string {
  return dateString.replace(/-/g, "");
}
