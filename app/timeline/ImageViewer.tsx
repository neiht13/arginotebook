// ImageModal.tsx
import React from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText: string;
}

const ImageViewer: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, altText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative">
        <img src={imageSrc || "/no-image.svg"} alt={altText} className="max-w-full max-h-screen rounded" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
