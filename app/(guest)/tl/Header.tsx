'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default function Header() {
  // State để quản lý trạng thái menu di động
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Hàm toggle menu di động
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-green-800 text-white fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* <img className="h-10 w-12"

                src={"logo_gcc.png"}
                alt="Logo"
              /> */}
            <span className="text-2xl font-bold">Nhật ký canh tác</span>
          </div>

          {/* Navigation dành cho màn hình lớn */}
          <nav className="hidden md:flex space-x-6">
          <Link href="#" className="hover:text-green-300 transition-colors duration-200">Trang chủ</Link>
          <Link href="#hero" className="hover:text-green-300 transition-colors duration-200">Giới Thiệu</Link>
          <Link href="#info" className="hover:text-green-300 transition-colors duration-200">Thông tin</Link>
          <Link href="#timeline" className="hover:text-green-300 transition-colors duration-200">Nhật ký</Link>
          <Link href="#contact" className="hover:text-green-300 transition-colors duration-200">Liên hệ</Link>
          </nav>

          {/* Nút Get Started dành cho màn hình lớn
          <div className="hidden md:block">
            <Button variant="outline" className="text-white border-white hover:bg-green-800 transition-colors duration-200">
              Get Started
            </Button>
          </div> */}

          {/* Nút Menu dành cho màn hình nhỏ */}
          <button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMobileMenu} 
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu di động */}
      <div 
        className={`md:hidden px-4 py-2 bg-green-800 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="flex flex-col space-y-2">
          <Link href="#" className="hover:text-green-300 transition-colors duration-200">Trang chủ</Link>
          <Link href="#hero" className="hover:text-green-300 transition-colors duration-200">Giới Thiệu</Link>
          <Link href="#info" className="hover:text-green-300 transition-colors duration-200">Thông tin</Link>
          <Link href="#timeline" className="hover:text-green-300 transition-colors duration-200">Nhật ký</Link>
          <Link href="#contact" className="hover:text-green-300 transition-colors duration-200">Liên hệ</Link>
        </nav>
        {/* <Button 
          variant="outline" 
          className="mt-4 w-full text-white border-white hover:bg-green-600 transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(false)} // Đóng menu khi nhấn nút
        >
          Get Started
        </Button> */}
      </div>
    </header>
  )
}
