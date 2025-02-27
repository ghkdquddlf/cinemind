export default function Footer() {
    return (
      <footer className="bg-gray-900 text-white p-4 text-center mt-10">
        <p>© {new Date().getFullYear()} MovieReview. All rights reserved.</p>
      </footer>
    );
  }