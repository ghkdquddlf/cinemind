import type { Movie } from "@/types/movie";

const KOBIS_API_KEY = process.env.NEXT_PUBLIC_KOBIS_API_KEY;
const KOBIS_BASE_URL = "http://www.kobis.or.kr/kobisopenapi/webservice/rest";

interface KobisMovieListResponse {
  boxOfficeResult: {
    dailyBoxOfficeList: Array<{
      movieCd: string;
      movieNm: string;
      openDt: string;
      audiCnt: string;
      audiAcc: string;
    }>;
  };
}

interface KobisMovieInfoResponse {
  movieInfoResult: {
    movieInfo: {
      movieCd: string;
      movieNm: string;
      movieNmEn: string;
      openDt: string;
      showTm: string;
      genres: Array<{ genreNm: string }>;
    };
  };
}

export async function getLatestMovies(): Promise<Movie[]> {
  try {
    if (!KOBIS_API_KEY) {
      throw new Error("KOBIS API 키가 설정되지 않았습니다.");
    }

    // 어제 날짜 구하기 (YYYYMMDD 형식)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDate = yesterday.toISOString().split("T")[0].replace(/-/g, "");

    console.log("Fetching box office data for date:", targetDate);

    // 박스오피스 순위 조회
    const boxOfficeUrl = `${KOBIS_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${targetDate}`;
    const boxOfficeResponse = await fetch(boxOfficeUrl);

    if (!boxOfficeResponse.ok) {
      const errorText = await boxOfficeResponse.text();
      throw new Error(`박스오피스 API 요청 실패: ${errorText}`);
    }

    const boxOfficeData: KobisMovieListResponse =
      await boxOfficeResponse.json();

    if (!boxOfficeData.boxOfficeResult?.dailyBoxOfficeList) {
      throw new Error("박스오피스 데이터 형식이 올바르지 않습니다.");
    }

    console.log(
      "Found movies:",
      boxOfficeData.boxOfficeResult.dailyBoxOfficeList.length
    );

    // 각 영화의 상세 정보 조회
    const movies = await Promise.all(
      boxOfficeData.boxOfficeResult.dailyBoxOfficeList.map(async (movie) => {
        console.log("Fetching details for movie:", movie.movieNm);
        const detailUrl = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movie.movieCd}`;
        const detailResponse = await fetch(detailUrl);

        if (!detailResponse.ok) {
          const errorText = await detailResponse.text();
          throw new Error(
            `영화 상세 정보 API 요청 실패 (${movie.movieNm}): ${errorText}`
          );
        }

        const detailData: KobisMovieInfoResponse = await detailResponse.json();

        if (!detailData.movieInfoResult?.movieInfo) {
          throw new Error(
            `영화 상세 정보 형식이 올바르지 않습니다: ${movie.movieNm}`
          );
        }

        const movieInfo = detailData.movieInfoResult.movieInfo;

        return {
          id: movie.movieCd,
          title: movieInfo.movieNm,
          original_title: movieInfo.movieNmEn || undefined,
          release_date: movieInfo.openDt,
          genres: movieInfo.genres.map((g) => g.genreNm),
          runtime: parseInt(movieInfo.showTm) || undefined,
          vote_count: parseInt(movie.audiAcc) || undefined,
          created_at: new Date().toISOString(),
        } as Movie;
      })
    );

    console.log("Successfully processed all movies");
    return movies;
  } catch (error) {
    console.error("Error fetching latest movies:", error);
    throw error; // 에러를 상위로 전파하여 더 자세한 에러 처리가 가능하게 함
  }
}
