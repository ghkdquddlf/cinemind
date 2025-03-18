import type { Movie } from "@/types/movie";

const KOBIS_API_KEY = process.env.NEXT_PUBLIC_KOBIS_API_KEY;
const KOBIS_BASE_URL = "http://www.kobis.or.kr/kobisopenapi/webservice/rest";
const KMDB_API_KEY = process.env.NEXT_PUBLIC_KMDB_API_KEY;
const KMDB_BASE_URL =
  "http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";

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

interface KMDbResponse {
  Data: {
    Result: Array<{
      DOCID: string;
      title: string;
      titleEng: string;
      titleOrg: string;
      prodYear: string;
      directors: {
        director: Array<{
          directorNm: string;
        }>;
      };
      actors: {
        actor: Array<{
          actorNm: string;
        }>;
      };
      plots: {
        plot: Array<{
          plotText: string;
        }>;
      };
      runtime: string;
      rating: string;
      genre: string;
      posters: string;
      stlls: string;
      repRlsDate: string;
      posterUrl?: string;
      plot?: string;
      [key: string]: unknown;
    }>;
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

// 영화진흥위원회 API를 통해 박스오피스 데이터 가져오기
export async function getBoxOfficeData(
  targetDate?: string
): Promise<KobisMovieListResponse["boxOfficeResult"]["dailyBoxOfficeList"]> {
  try {
    if (!KOBIS_API_KEY) {
      throw new Error("KOBIS API 키가 설정되지 않았습니다.");
    }

    // 날짜가 제공되지 않은 경우 어제 날짜 사용
    if (!targetDate) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = yesterday.toISOString().split("T")[0].replace(/-/g, "");
    }

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

    return boxOfficeData.boxOfficeResult.dailyBoxOfficeList;
  } catch (error) {
    console.error("Error fetching box office data:", error);
    throw error;
  }
}

// 영화진흥위원회 API를 통해 영화 상세 정보 가져오기
export async function getKobisMovieDetail(
  movieCd: string
): Promise<KobisMovieInfoResponse["movieInfoResult"]["movieInfo"]> {
  try {
    if (!KOBIS_API_KEY) {
      throw new Error("KOBIS API 키가 설정되지 않았습니다.");
    }

    const detailUrl = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
    const detailResponse = await fetch(detailUrl);

    if (!detailResponse.ok) {
      const errorText = await detailResponse.text();
      throw new Error(`영화 상세 정보 API 요청 실패: ${errorText}`);
    }

    const detailData: KobisMovieInfoResponse = await detailResponse.json();

    if (!detailData.movieInfoResult?.movieInfo) {
      throw new Error("영화 상세 정보 형식이 올바르지 않습니다.");
    }

    return detailData.movieInfoResult.movieInfo;
  } catch (error) {
    console.error("Error fetching movie detail:", error);
    throw error;
  }
}

// 한국영상자료원 KMDb API를 통해 영화 정보 검색
export async function searchKMDbMovies(
  query: string
): Promise<KMDbResponse["Data"]["Result"]> {
  try {
    if (!KMDB_API_KEY) {
      throw new Error("KMDb API 키가 설정되지 않았습니다.");
    }

    console.log(`[searchKMDbMovies] 검색 시작: "${query}"`);

    // API 요청 파라미터 추가 및 개선
    const params = new URLSearchParams({
      collection: "kmdb_new2",
      detail: "Y",
      title: query,
      ServiceKey: KMDB_API_KEY,
      listCount: "100", // 결과 수 증가
    });

    const searchUrl = `${KMDB_BASE_URL}?${params.toString()}`;
    console.log(`[searchKMDbMovies] API URL: ${searchUrl}`);

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    console.log(
      `[searchKMDbMovies] API 응답 상태: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[searchKMDbMovies] API 응답 오류: ${response.status} ${response.statusText}`
      );
      console.error(`[searchKMDbMovies] 오류 내용: ${errorText}`);
      throw new Error(`KMDb 검색 API 요청 실패: ${errorText}`);
    }

    const responseText = await response.text();
    console.log(
      `[searchKMDbMovies] API 응답 텍스트 (처음 200자): ${responseText.substring(
        0,
        200
      )}...`
    );

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[searchKMDbMovies] JSON 파싱 오류:`, e);
      console.error(`[searchKMDbMovies] 응답 텍스트:`, responseText);
      throw new Error("API 응답을 JSON으로 파싱할 수 없습니다.");
    }

    console.log(`[searchKMDbMovies] API 응답 구조:`, Object.keys(data));

    // 응답 구조 확인 및 처리
    if (!data.Data) {
      console.log(`[searchKMDbMovies] 'Data' 필드 없음:`, data);
      return [];
    }

    // KMDB API는 Data 필드가 배열로 반환됨
    if (!Array.isArray(data.Data) || data.Data.length === 0) {
      console.log(`[searchKMDbMovies] 'Data' 배열이 비어있음:`, data.Data);
      return [];
    }

    if (!data.Data[0].Result) {
      console.log(`[searchKMDbMovies] 'Result' 필드 없음:`, data.Data[0]);
      return [];
    }

    const results = data.Data[0].Result;
    console.log(`[searchKMDbMovies] 검색 결과: ${results.length}개`);

    // 첫 번째 결과의 포스터 정보 로깅
    if (results.length > 0) {
      const firstResult = results[0];
      console.log(`[searchKMDbMovies] 첫 번째 결과:`, {
        title: firstResult.title,
        posters: firstResult.posters || "없음",
        DOCID: firstResult.DOCID || "없음",
      });

      // 포스터 URL 형식 자세히 분석
      if (firstResult.posters) {
        console.log(
          `[searchKMDbMovies] 포스터 문자열 길이: ${firstResult.posters.length}`
        );
        console.log(
          `[searchKMDbMovies] 포스터 문자열 전체: ${firstResult.posters}`
        );

        const posterUrls = firstResult.posters.split("|");
        console.log(`[searchKMDbMovies] 포스터 URL 개수: ${posterUrls.length}`);

        if (posterUrls.length > 0) {
          let firstPosterUrl = posterUrls[0].trim();
          console.log(
            `[searchKMDbMovies] 첫 번째 포스터 URL (원본): ${
              firstPosterUrl || "빈 문자열"
            }`
          );

          // URL이 http:// 또는 https://로 시작하는지 확인
          if (
            firstPosterUrl &&
            !firstPosterUrl.startsWith("http://") &&
            !firstPosterUrl.startsWith("https://")
          ) {
            firstPosterUrl = `https://${firstPosterUrl}`;
            console.log(
              `[searchKMDbMovies] 첫 번째 포스터 URL (수정): ${firstPosterUrl}`
            );
          }

          // URL 유효성 검사
          try {
            new URL(firstPosterUrl);
            console.log(`[searchKMDbMovies] 유효한 URL 형식입니다.`);
          } catch (e) {
            console.log(
              `[searchKMDbMovies] 유효하지 않은 URL 형식입니다: ${
                e instanceof Error ? e.message : "Unknown error"
              }`
            );
            firstPosterUrl = ""; // 유효하지 않은 URL은 빈 문자열로 설정
          }
        }
      }
    }

    // API 응답 형식을 웹 앱에서 사용하기 쉬운 형태로 변환
    return results.map((movie: KMDbResponse["Data"]["Result"][0]) => {
      // 원본 데이터 로깅
      console.log(`[searchKMDbMovies] 영화 데이터 구조:`, Object.keys(movie));
      console.log(
        `[searchKMDbMovies] posterUrl 필드 존재:`,
        movie.hasOwnProperty("posterUrl")
      );
      console.log(
        `[searchKMDbMovies] posters 필드 존재:`,
        movie.hasOwnProperty("posters")
      );

      if (movie.posterUrl) {
        console.log(`[searchKMDbMovies] posterUrl 값:`, movie.posterUrl);
      }
      if (movie.posters) {
        console.log(`[searchKMDbMovies] posters 값:`, movie.posters);
      }

      // 포스터 URL 처리
      let posterUrl = null;

      // 직접 API 응답 구조 확인
      const allKeys = Object.keys(movie);
      const posterKeys = allKeys.filter((key) =>
        key.toLowerCase().includes("poster")
      );
      console.log(`[searchKMDbMovies] 포스터 관련 키:`, posterKeys);

      // 모든 가능한 포스터 필드 확인
      for (const key of posterKeys) {
        const value = movie[key];
        if (value && typeof value === "string" && value.trim()) {
          console.log(`[searchKMDbMovies] 포스터 필드 ${key}:`, value);

          // URL 처리 시도
          let url = value.trim();

          // 파이프로 구분된 경우 첫 번째 URL 사용
          if (url.includes("|")) {
            const urls = url.split("|").filter((u) => u.trim());
            if (urls.length > 0) {
              url = urls[0].trim();
              console.log(
                `[searchKMDbMovies] 파이프로 구분된 URL 중 첫 번째:`,
                url
              );
            } else {
              continue; // 유효한 URL이 없으면 다음 필드로
            }
          }

          // URL에 프로토콜 추가
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
            console.log(`[searchKMDbMovies] 프로토콜 추가:`, url);
          }

          // URL 유효성 검사
          try {
            new URL(url);
            posterUrl = url;
            break; // 유효한 URL을 찾았으므로 반복 중단
          } catch {
            console.log(`[searchKMDbMovies] 유효하지 않은 URL (${key}):`, url);
          }
        }
      }

      // 이전 방식으로도 시도 (posterUrl 필드)
      if (!posterUrl && movie.posterUrl) {
        let url = movie.posterUrl.trim();
        if (url) {
          // URL에 프로토콜 추가
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
          }
          // URL 유효성 검사
          try {
            new URL(url);
            posterUrl = url;
            console.log(
              `[searchKMDbMovies] 유효한 포스터 URL (posterUrl):`,
              posterUrl
            );
          } catch {
            console.log(
              `[searchKMDbMovies] 유효하지 않은 포스터 URL (posterUrl):`,
              url
            );
          }
        }
      }

      // 이전 방식으로도 시도 (posters 필드)
      if (!posterUrl && movie.posters) {
        const urls = movie.posters.split("|");
        if (urls.length > 0 && urls[0].trim()) {
          let url = urls[0].trim();
          // URL에 프로토콜 추가
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
          }
          // URL 유효성 검사
          try {
            new URL(url);
            posterUrl = url;
            console.log(
              `[searchKMDbMovies] 유효한 포스터 URL (posters 필드):`,
              posterUrl
            );
          } catch {
            console.log(
              `[searchKMDbMovies] 유효하지 않은 포스터 URL (posters 필드):`,
              url
            );
          }
        }
      }

      // 제목에서 !HS, !HE 같은 태그 제거
      let cleanTitle = movie.title || "";
      cleanTitle = cleanTitle.replace(/!HS|!HE/g, "").trim();
      console.log(
        `[searchKMDbMovies] 원본 제목: "${movie.title}", 정제된 제목: "${cleanTitle}"`
      );

      // 줄거리 처리
      let plotText = "";
      if (movie.plot) {
        // plot 필드가 직접 문자열로 제공되는 경우
        plotText = movie.plot;
        console.log(
          `[searchKMDbMovies] 줄거리(plot 필드): ${plotText.substring(
            0,
            30
          )}...`
        );
      } else if (movie.plots?.plot?.[0]?.plotText) {
        // plots.plot[].plotText 구조로 제공되는 경우
        plotText = movie.plots.plot[0].plotText;
        console.log(
          `[searchKMDbMovies] 줄거리(plots.plot[].plotText): ${plotText.substring(
            0,
            30
          )}...`
        );
      }

      return {
        id: movie.DOCID,
        title: cleanTitle,
        titleEng: movie.titleEng,
        prodYear: movie.prodYear,
        director: movie.directors?.director?.[0]?.directorNm || "",
        actors:
          movie.actors?.actor
            ?.slice(0, 5)
            .map((a: { actorNm: string }) => a.actorNm) || [],
        runtime: movie.runtime,
        rating: movie.rating,
        genre: movie.genre,
        plot: plotText,
        poster: posterUrl,
        releaseDate: movie.repRlsDate,
        DOCID: movie.DOCID,
      };
    });
  } catch (error) {
    console.error("Error searching KMDb movies:", error);
    throw error;
  }
}

// 한국영상자료원 KMDb API를 통해 영화 상세 정보 가져오기
export async function getKMDbMovieDetail(
  movieId: string
): Promise<KMDbResponse["Data"]["Result"][0]> {
  try {
    if (!KMDB_API_KEY) {
      throw new Error("KMDb API 키가 설정되지 않았습니다.");
    }

    const detailUrl = `${KMDB_BASE_URL}?collection=kmdb_new2&detail=Y&docid=${movieId}&ServiceKey=${KMDB_API_KEY}`;
    const response = await fetch(detailUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KMDb 상세 정보 API 요청 실패: ${errorText}`);
    }

    const data: KMDbResponse = await response.json();

    if (!data.Data?.Result || data.Data.Result.length === 0) {
      throw new Error("영화 상세 정보를 찾을 수 없습니다.");
    }

    return data.Data.Result[0];
  } catch (error) {
    console.error("Error fetching KMDb movie detail:", error);
    throw error;
  }
}

// 영화진흥위원회 API와 한국영상자료원 KMDb API를 결합하여 완전한 영화 정보 가져오기
export async function getCompleteMovieInfo(
  movieCd: string,
  movieTitle: string
): Promise<Movie> {
  try {
    // 영화진흥위원회 API에서 기본 정보 가져오기
    const kobisInfo = await getKobisMovieDetail(movieCd);

    // 한국영상자료원 KMDb API에서 추가 정보 검색
    const kmdbResults = await searchKMDbMovies(movieTitle);

    // 가장 적합한 결과 찾기 (제목과 개봉년도로 매칭)
    const releaseYear = kobisInfo.openDt
      ? kobisInfo.openDt.substring(0, 4)
      : "";

    // 매칭 점수 계산 함수
    const calculateMatchScore = (movie: KMDbResponse["Data"]["Result"][0]) => {
      let score = 0;

      // 제목에서 !HS, !HE 같은 태그 제거
      let cleanKmdbTitle = movie.title || "";
      cleanKmdbTitle = cleanKmdbTitle.replace(/!HS|!HE/g, "").trim();

      // 제목 유사도 (공백 제거 후 포함 여부)
      const normalizedTitle = movieTitle.replace(/\s/g, "").toLowerCase();
      const normalizedKmdbTitle = cleanKmdbTitle
        .replace(/\s/g, "")
        .toLowerCase();

      if (normalizedKmdbTitle === normalizedTitle) {
        score += 5; // 완전 일치
      } else if (
        normalizedKmdbTitle.includes(normalizedTitle) ||
        normalizedTitle.includes(normalizedKmdbTitle)
      ) {
        score += 3; // 부분 일치
      }

      // 개봉년도 일치
      if (releaseYear && movie.prodYear === releaseYear) {
        score += 3;
      }

      // 감독 정보가 있는 경우 추가 점수
      if (movie.directors?.director?.length > 0) {
        score += 1;
      }

      return score;
    };

    // 매칭 점수가 가장 높은 결과 선택
    let bestMatch = null;
    let highestScore = -1;

    for (const movie of kmdbResults) {
      const score = calculateMatchScore(movie);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = movie;
      }
    }

    // 최소 매칭 점수 기준 (3점 이상이면 유효한 매칭으로 간주)
    const matchedResult = highestScore >= 3 ? bestMatch : null;

    // 영화 정보 통합
    const movie: Movie = {
      id: movieCd,
      title: kobisInfo.movieNm,
      original_title: kobisInfo.movieNmEn || undefined,
      release_date: kobisInfo.openDt || "",
      genres:
        kobisInfo.genres?.map((g: { genreNm: string }) => g.genreNm) || [],
      runtime: parseInt(kobisInfo.showTm) || undefined,
      created_at: new Date().toISOString(),
    };

    // KMDb 정보가 있으면 추가 정보 병합
    if (matchedResult) {
      // 제목에서 !HS, !HE 같은 태그 제거
      if (matchedResult.title) {
        const cleanTitle = matchedResult.title.replace(/!HS|!HE/g, "").trim();

        // KOBIS 제목이 없거나 빈 문자열인 경우에만 KMDB 제목 사용
        if (!movie.title || movie.title.trim() === "") {
          movie.title = cleanTitle;
        }
      }

      // 포스터 이미지 URL 추출
      let posterUrl = undefined;

      // 직접 API 응답 구조 확인
      const allKeys = Object.keys(matchedResult);
      const posterKeys = allKeys.filter((key) =>
        key.toLowerCase().includes("poster")
      );

      // 모든 가능한 포스터 필드 확인
      for (const key of posterKeys) {
        const value = matchedResult[key];
        if (value && typeof value === "string" && value.trim()) {
          // URL 처리 시도
          let url = value.trim();

          // 파이프로 구분된 경우 첫 번째 URL 사용
          if (url.includes("|")) {
            const urls = url.split("|").filter((u: string) => u.trim());
            if (urls.length > 0) {
              url = urls[0].trim();
            } else {
              continue; // 유효한 URL이 없으면 다음 필드로
            }
          }

          // URL에 프로토콜 추가
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
          }

          // URL 유효성 검사
          try {
            new URL(url);
            posterUrl = url;
            break; // 유효한 URL을 찾았으므로 반복 중단
          } catch {
            // 유효하지 않은 URL은 무시
            console.log(`[getCompleteMovieInfo] 유효하지 않은 URL: ${url}`);
          }
        }
      }

      // 줄거리 추출
      let overview = undefined;

      // plot 필드 확인
      if (matchedResult.plot) {
        overview = matchedResult.plot;
      }
      // plots.plot[].plotText 구조 확인
      else if (matchedResult.plots?.plot?.[0]?.plotText) {
        overview = matchedResult.plots.plot[0].plotText;
      }

      // 추가 정보 병합
      movie.poster_path = posterUrl;
      // description 필드에 줄거리 저장 (올바른 필드명 사용)
      movie.description = overview;
    }

    return movie;
  } catch (error) {
    console.error("Error getting complete movie info:", error);
    throw error;
  }
}
