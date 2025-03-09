// 박스오피스 영화 정보 인터페이스
export interface BoxOfficeMovie {
  movieNm: string;
  movieCd: string;
  rank: string;
  openDt: string;
  audiCnt: string;
  audiAcc: string;
}

// 박스오피스 결과 인터페이스
export interface BoxOfficeResult {
  title: string;
  movieCd: string;
  rank: string;
  openDt: string;
  audiCnt: string;
  audiAcc: string;
  type: string;
  success?: boolean;
  error?: string;
}

// 영화 검색 결과 인터페이스
export interface SearchResult {
  title: string;
  kmdbId: string;
  director: string;
  year: string;
  posterUrl?: string;
  id: string;
  poster?: string;
  prodYear: string;
  runtime: string;
  genre: string;
  plot?: string;
}

// 영화 추가 성공 결과 인터페이스
export interface AddSuccessResult {
  id: string;
  title: string;
}
