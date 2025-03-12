// 사용자 타입
export type User = {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
  last_sign_in_at: string | null;
};

// 사용자 프로필 타입
export type UserProfile = {
  id: string;
  user_id: string;
  email?: string;
  nickname?: string;
  created_at?: string;
};

// 리뷰 타입
export type Review = {
  id: string;
  user_id: string;
  movie_id: string;
  content: string;
  rating: number;
  created_at: string;
  user_email?: string;
  user_nickname?: string;
  movie_title?: string;
};

// 영화 타입
export type Movie = {
  id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  created_at?: string;
};
