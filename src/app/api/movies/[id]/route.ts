import { NextResponse } from "next/server";
import { getMovieById } from "@/lib/movies";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await getMovieById(params.id);

    if (!movie) {
      return NextResponse.json(
        { error: "영화를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ movie });
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      { error: "영화 정보를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
