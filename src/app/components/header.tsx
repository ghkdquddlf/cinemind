import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          <Link href="/">🎬 MovieReview</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/movies" className="hover:text-blue-500">영화</Link></li>
            <li><Link href="/profile" className="hover:text-blue-500">내 리뷰</Link></li>
            <li><Link href="/login" className="hover:text-blue-500">로그인</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}