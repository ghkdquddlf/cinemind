import type { Movie } from "@/types/movie";
import { createClient } from "./supabase/client";

const supabase = createClient();

export async function saveMovie(movie: Movie) {
  try {
    console.log("Saving movie:", movie.title);
    const { data, error } = await supabase
      .from("movies")
      .upsert(movie, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error in saveMovie:", error);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error("Error saving movie:", error);
    return { data: null, error };
  }
}

export async function getMovies() {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getMovies:", error);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching movies:", error);
    return { data: null, error };
  }
}

export async function getMovieById(id: string) {
  try {
    const { data: movie, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return movie;
  } catch (error) {
    console.error("Error in getMovieById:", error);
    throw error;
  }
}
