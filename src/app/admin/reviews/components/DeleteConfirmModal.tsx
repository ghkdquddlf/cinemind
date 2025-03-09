"use client";

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteConfirmModal({
  onCancel,
  onConfirm,
  loading,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">리뷰 삭제 확인</h2>
          <p className="mb-6">
            정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={loading}
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              disabled={loading}
            >
              {loading ? "처리 중..." : "삭제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
