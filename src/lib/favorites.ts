import { createClient } from "./supabase/client";
import type { Movie } from "@/types/movie";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = createClient();

export async function addToFavorites(movieId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { error } = await supabase
      .from("favorites")
      .insert({ movie_id: movieId, user_id: user.id });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

export async function removeFromFavorites(movieId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { error } = await supabase
      .from("favorites")
      .delete()
      .match({ movie_id: movieId, user_id: user.id });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

export async function isFavorite(movieId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("favorites")
      .select()
      .match({ movie_id: movieId, user_id: user.id })
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
}

export async function getFavorites(): Promise<Movie[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data, error } = (await supabase
      .from("favorites")
      .select(
        `
        movies (
          id,
          title,
          original_title,
          release_date,
          poster_path,
          genres,
          runtime,
          vote_count,
          description
        )
      `
      )
      .eq("user_id", user.id)) as {
      data: { movies: Movie }[] | null;
      error: PostgrestError | null;
    };

    if (error) throw error;

    if (!data) return [];

    return data.map((item) => item.movies);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
}
