import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_KOBIS_API_KEY;
const BASE_URL =
  "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}&movieCd=${id}`);
    if (!res.ok) throw new Error("KOBIS API 요청 실패");

    const data = await res.json();

    const movieInfo = data.movieInfoResult?.movieInfo;

    if (!movieInfo) {
      return NextResponse.json(
        { error: "영화 정보를 찾을 수 없음" },
        { status: 404 }
      );
    }

    return NextResponse.json(movieInfo);
  } catch (error) {
    console.error("KOBIS API 요청 실패:", error);
    return NextResponse.json({ error: "API 요청 실패" }, { status: 500 });
  }
}
