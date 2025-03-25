"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Calendar, BarChart2, Settings, User, Menu, X, LogOut, Leaf, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { toast } from "react-toastify"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick?: () => void
}

const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      isActive ? "bg-lime-100 text-lime-800 font-medium" : "text-slate-600 hover:bg-slate-100",
    )}
  >
    {icon}
    <span>{label}</span>
    {isActive && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute left-0 w-1 h-8 bg-lime-500 rounded-r-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </Link>
)

// Bottom navigation item component
const BottomNavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative",
      isActive ? "text-lime-700" : "text-slate-500",
    )}
  >
    <div className="relative">
      {icon}
      {isActive && (
        <motion.div
          layoutId="bottomActiveIndicator"
          className="absolute -inset-1 rounded-full bg-lime-100"
          style={{ zIndex: -1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </Link>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Track scroll position for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/nhatky", icon: <Calendar className="w-5 h-5" />, label: "Nhật ký" },
    { href: "/danhmuc", icon: <LayoutDashboard className="w-5 h-5" />, label: "Danh mục" },
    { href: "/vattu", icon: <Package className="w-5 h-5" />, label: "Vật tư" },
    { href: "/statistics", icon: <BarChart2 className="w-5 h-5" />, label: "Thống kê" },
    { href: "/ultilities", icon: <Settings className="w-5 h-5" />, label: "Tiện ích" },
    { href: "/profile", icon: <User className="w-5 h-5" />, label: "Người dùng" },
    { href: "/admin", icon: <Settings className="w-5 h-5" />, label: "Quản trị" },
  ]

  // Mobile navigation items (limited to 5 for bottom nav)
  const mobileNavItems = [
    { href: "/nhatky", icon: <Calendar className="w-5 h-5" />, label: "Nhật ký" },
    { href: "/danhmuc", icon: <LayoutDashboard className="w-5 h-5" />, label: "Danh mục" },
    { href: "/vattu", icon: <Package className="w-5 h-5" />, label: "Vật tư" },
    { href: "/statistics", icon: <BarChart2 className="w-5 h-5" />, label: "Thống kê" },
    { href: "/ultilities", icon: <Settings className="w-5 h-5" />, label: "Tiện ích" },
    { href: "/profile", icon: <User className="w-5 h-5" />, label: "Người dùng" },
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" }).then(() => toast.success("Đã đăng xuất thành công"))
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 p-4 bg-white border-r border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-2 py-4">
          <Leaf className="w-8 h-8 text-lime-700" />
          <h1 className="text-xl font-bold text-slate-800">Nhật ký canh tác</h1>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>
{/* 
      {/* Mobile Header */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between transition-shadow duration-200",
          scrolled ? "shadow-md" : "",
        )}
      >
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-lime-700" />
          <h1 className="text-lg font-bold text-slate-800">Nhật ký canh tác</h1>
        </div>
      </div> 

      {/* Mobile Menu
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-20 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 bottom-0 w-64 bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-2 py-4">
                <Leaf className="w-8 h-8 text-lime-700" />
                <h1 className="text-xl font-bold text-slate-800">Nhật ký canh tác</h1>
              </div>

              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname === item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </nav>

              <div className="mt-auto pt-4 border-t border-slate-200">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg">
        <motion.nav
          className="flex justify-around items-center h-16 px-2"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
        >
          {mobileNavItems.map((item) => (
            <BottomNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </motion.nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        <div className="md:hidden h-14"></div> {/* Spacer for mobile header */}
        <div className="p-4 md:p-6 pb-20 md:pb-6">{children}</div> {/* Added bottom padding for mobile */}
      </main>
    </div>
  )
}

