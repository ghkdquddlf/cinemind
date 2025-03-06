import { MovieList } from "./(home)/components/dailyboxopfficelist";
import { RandomMovies } from "./(home)/components/randomMovies";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">일별 박스오피스</h1>
      <MovieList />
      <div className="mt-8">
        <RandomMovies />
      </div>
    </main>
  );
}
