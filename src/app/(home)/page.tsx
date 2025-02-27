"use client";
import { MovieList } from "./components/dailyboxopfficelist";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        🎬 일별 박스오피스
      </h1>
      <MovieList />
    </main>
  );
}
