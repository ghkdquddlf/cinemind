"use client";

interface ReviewFormProps {
  author: string;
  content: string;
  password: string;
  onAuthorChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ReviewForm({
  author,
  content,
  password,
  onAuthorChange,
  onContentChange,
  onPasswordChange,
  onSubmit,
}: ReviewFormProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">리뷰 작성</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block mb-1">
            작성자
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            required
            className="w-full p-2 border rounded h-24"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          리뷰 작성
        </button>
      </form>
    </div>
  );
}
