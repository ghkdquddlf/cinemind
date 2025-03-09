export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white p-4 text-center mt-10 transition-colors">
      <p>© {new Date().getFullYear()} CineMind. All rights reserved.</p>
    </footer>
  );
}
