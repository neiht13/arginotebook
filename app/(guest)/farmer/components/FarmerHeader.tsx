"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FarmerHeaderProps {
  user: any
}

export default function FarmerHeader({ user }: FarmerHeaderProps) {
  const [currentImage, setCurrentImage] = useState(0)

  // Default banner images if user doesn't have any
  const defaultImages = [
    "https://futureoffood.org/wp-content/uploads/2021/05/WEB-rice-planting.jpg",
    "https://modernfarmer.com/wp-content/uploads/2022/04/shutterstock_1566410314.jpg",
    "https://th.bing.com/th/id/R.180d15a29a33ee008e67bc14ad5c5923?rik=XZBbOLKCNM2Z1Q&pid=ImgRaw&r=0",
  ]

  // Use product images if available, otherwise use default images
  const images = user.bannerImages?.length > 0 ? user.bannerImages : defaultImages

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(timer)
  }, [images.length])

  const nextImage = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length)
  }

  return (
    <div className="relative">
      {/* Banner Image Carousel */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {images.map((src, index) => (
          <motion.img
            key={index}
            src={src}
            alt={`Banner ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === currentImage ? 1 : 0,
              transition: { duration: 1 },
            }}
          />
        ))}

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/60 backdrop-blur-sm border-0 z-10"
          onClick={prevImage}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/60 backdrop-blur-sm border-0 z-10"
          onClick={nextImage}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Farmer Name and Description Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 text-white">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{user.name || "Nông hộ"}</h1>
          <p className="text-lg md:text-2xl opacity-90 max-w-3xl">
            {user.slogan || user.description || "Sản xuất nông nghiệp bền vững, chất lượng cao"}
          </p>
        </div>
      </div>
    </div>
  )
}

