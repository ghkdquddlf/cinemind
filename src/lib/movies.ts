import type { Movie } from "@/types/movie";
import { createClient } from "./supabase/client";

const supabase = createClient();

// 영화 중복 검사 함수 - 제목만으로 중복 확인
export async function checkMovieDuplicate(title: string): Promise<{ isDuplicate: boolean; existingId?: string }> {
  try {
    console.log(`중복 검사 시작: "${title}"`);

    // 제목 정규화 (특수문자 제거, 소문자 변환, 공백 제거)
    const normalizedTitle = title.replace(/[^\w\s가-힣]/g, '').toLowerCase().replace(/\s+/g, '');

    // 모든 영화 가져오기
    const { data, error } = await supabase
      .from("movies")
      .select("id, title");

    if (error) {
      console.error("Error checking movie duplicate:", error);
      return { isDuplicate: false };
    }

    // 정확히 같은 제목이 있는지 확인 (정규화 후 비교)
    const exactMatch = data?.find(movie => {
      const dbNormalizedTitle = movie.title.replace(/[^\w\s가-힣]/g, '').toLowerCase().replace(/\s+/g, '');
      return dbNormalizedTitle === normalizedTitle;
    });

    if (exactMatch) {
      console.log(`중복 영화 발견: ID=${exactMatch.id}, 제목="${exactMatch.title}"`);
      return { isDuplicate: true, existingId: exactMatch.id };
    }

    console.log(`중복 영화 없음: "${title}"`);
    return { isDuplicate: false };
  } catch (error) {
    console.error("Error in checkMovieDuplicate:", error);
    return { isDuplicate: false };
  }
}

export async function saveMovie(movie: Movie) {
  try {
    // 중복 검사 - 제목만으로 확인
    const { isDuplicate, existingId } = await checkMovieDuplicate(movie.title);

    if (isDuplicate && existingId) {
      console.log(`영화 "${movie.title}"는 이미 ID ${existingId}로 존재합니다. 업데이트합니다.`);
      // 기존 ID를 사용하여 업데이트
      movie.id = existingId;
    }

    // 저장할 데이터 객체 생성 (명시적으로 필드 지정)
    const movieData = {
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      release_date: movie.release_date,
      genres: movie.genres,
      runtime: movie.runtime,
      vote_count: movie.vote_count,
      created_at: movie.created_at,
      poster_path: movie.poster_path,
      description: movie.description || movie.overview // 올바른 필드명 사용
    };

    const { data, error } = await supabase
      .from("movies")
      .upsert(movieData, {
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
