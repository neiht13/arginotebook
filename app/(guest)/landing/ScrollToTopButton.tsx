// components/ScrollToTopButton.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  // Hiển thị nút khi người dùng cuộn xuống một khoảng nhất định
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) { // Hiển thị khi cuộn xuống 300px
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <>
      {isVisible && (
        <Button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-green-800 text-white p-3 rounded-full shadow-lg hover:bg-green-800 transition-colors duration-300 z-50"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}
