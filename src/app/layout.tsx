import "./globals.css";  // Tailwind 스타일 적용
import Header from "./components/header";
import Footer from "./components/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 text-gray-900">
        <Header />
        <main className="max-w-6xl mx-auto p-6 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}