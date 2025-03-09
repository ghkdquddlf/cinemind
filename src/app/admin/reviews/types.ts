// 리뷰 인터페이스
export interface Review {
  id: string;
  movie_id: string;
  author: string;
  content: string;
  rating: number;
  created_at: string;
  movie_title?: string;
}

// 영화 인터페이스
export interface Movie {
  id: string;
  title: string;
}

// 필터 상태 인터페이스
export interface FilterState {
  filterMovie: string;
  filterRating: string;
  searchTerm: string;
}
