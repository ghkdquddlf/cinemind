import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_KOBIS_API_KEY;
const BASE_URL = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json";

// 날짜 변환 함수 (YYYYMMDD 형식)
function getFormattedDate() {
  const today = new Date();
  today.setDate(today.getDate() - 1); // 기본값: 하루 전 날짜
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetDate = searchParams.get("targetDt") || getFormattedDate(); // 날짜 선택 가능

  try {
    // KOBIS JSON API 호출
    const res = await fetch(`${BASE_URL}?key=${API_KEY}&targetDt=${targetDate}`);
    if (!res.ok) throw new Error("KOBIS API 요청 실패");

    const data = await res.json();

    // JSON에서 박스오피스 리스트 추출
    const boxOfficeList = data.boxOfficeResult?.dailyBoxOfficeList || [];

    if (boxOfficeList.length === 0) {
      return NextResponse.json({ error: "박스오피스 데이터를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(boxOfficeList);
  } catch (error) {
    console.error("KOBIS API 요청 실패:", error);
    return NextResponse.json({ error: "API 요청 실패" }, { status: 500 });
  }
}
