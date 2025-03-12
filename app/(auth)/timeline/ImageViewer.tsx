// ImageModal.tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-70">
      <div className="relative w-full h-screen">
        <Image src={imageSrc || "/no-image.svg"} alt={altText} fill className="max-w-full max-h-screen rounded" />
        <Button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-slate-800 bg-opacity-50 rounded-full p-3 hover:bg-opacity-75"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default ImageViewer;
