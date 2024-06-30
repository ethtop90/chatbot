// frontend/src/components/common/Modal.tsx

import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

const EditModal: React.FC<ModalProps> = ({ title, onClose, onSave, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div>{children}</div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onSave}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            保管
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
