// src/app/(home)/components/MovieList.tsx
"use client";
import { useEffect, useState } from "react";
import { MovieItem } from "./dailyboxofficeitem";

interface Movie {
    movieCd: string;
    rank: string;
    movieNm: string;
    openDt: string;
    audiCnt: string;
    salesAmt: string;
}

export function MovieList() {
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        async function fetchMovies() {
            const res = await fetch("/api/kobis");
            const data = await res.json();
            setMovies(data);
        }
        fetchMovies();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {movies.map((movie) => (
                <MovieItem key={movie.movieCd} movie={movie} />
            ))}
        </div>
    );
}