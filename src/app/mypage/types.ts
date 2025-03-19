export type TabType = "reviews" | "favorites" | "profile";

export interface Review {
  id: string;
  user_id: string;
  movie_id: string;
  content: string;
  rating: number;
  created_at: string;
  author: string;
  movie_title?: string;
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
  created_at: string;
  movie_title?: string;
  poster_path?: string;
  movies?: {
    id: string;
    title: string;
    poster_path: string;
    release_date: string;
    description: string;
  };
}
