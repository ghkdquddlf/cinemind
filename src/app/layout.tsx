import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Tailwind 스타일 적용
import Header from "./components/header";
import Footer from "./components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "영화 리뷰",
  description: "영화 리뷰 사이트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="max-w-6xl mx-auto p-6 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
