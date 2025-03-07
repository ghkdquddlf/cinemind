export interface Movie {
  id: string;
  title: string;
  original_title?: string;
  release_date: string;
  overview?: string;
  poster_path?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genres?: string[];
  runtime?: number;
  created_at?: string;
  description?: string;
}
