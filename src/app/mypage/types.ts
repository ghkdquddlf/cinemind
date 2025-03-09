export type TabType = "reviews" | "replies" | "favorites" | "profile";

export interface Review {
  id: string;
  movie_id: string;
  author: string;
  content: string;
  rating?: number;
  created_at: string;
  user_id?: string;
  movies?: {
    id: string;
    title: string;
    poster_path?: string;
  };
}

export interface Reply {
  id: string;
  review_id: string;
  author: string;
  content: string;
  created_at: string;
  user_id?: string;
  reviews?: {
    id: string;
    content: string;
    movie_id: string;
    movies?: {
      id: string;
      title: string;
    };
  };
}

export interface Movie {
  id: string;
  title: string;
  poster_path?: string;
  release_date?: string;
  description?: string;
  overview?: string;
}

export interface FavoriteItem {
  id: string;
  user_id: string;
  movie_id: string;
  created_at?: string;
  movies?: Movie;
}
