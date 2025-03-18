"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageViewerProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  altText: string
}

const ImageViewer: React.FC<ImageViewerProps> = ({ isOpen, onClose, imageSrc, altText }) => {
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)

  // Reset zoom and rotation when opening a new image
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
    }
  }, [isOpen, imageSrc])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "+":
          setScale((prev) => Math.min(prev + 0.25, 3))
          break
        case "-":
          setScale((prev) => Math.max(prev - 0.25, 0.5))
          break
        case "r":
          setRotation((prev) => (prev + 90) % 360)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5))
  const rotate = () => setRotation((prev) => (prev + 90) % 360)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={onClose}
        >
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={imageSrc || "/placeholder.svg"}
              alt={altText}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: scale }}
              exit={{ opacity: 0, scale: 0.8 }}
            />

            {/* Close button */}
            <Button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-2"
              size="icon"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                onClick={zoomIn}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full"
                size="icon"
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
              <Button
                onClick={zoomOut}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full"
                size="icon"
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button
                onClick={rotate}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full"
                size="icon"
              >
                <RotateCw className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ImageViewer

