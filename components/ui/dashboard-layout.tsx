"use client"

import type React from "react"
import { useState } from "react"
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
      isActive ? "bg-lime-100 text-lime-700 font-medium" : "text-slate-600 hover:bg-slate-100",
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/timeline", icon: <Calendar className="w-5 h-5" />, label: "Nhật ký" },
    { href: "/category", icon: <LayoutDashboard className="w-5 h-5" />, label: "Danh mục" },
    { href: "/vattu", icon: <Package className="w-5 h-5" />, label: "Vật tư" },
    { href: "/statistics", icon: <BarChart2 className="w-5 h-5" />, label: "Thống kê" },
    { href: "/ultilities", icon: <Settings className="w-5 h-5" />, label: "Tiện ích" },
    { href: "/profile", icon: <User className="w-5 h-5" />, label: "Người dùng" },
    { href: "/admin", icon: <Settings className="w-5 h-5" />, label: "Quản trị" },
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" }).then(() => toast.success("Đã đăng xuất thành công"))
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 p-4 bg-white border-r border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-2 py-4">
          <Leaf className="w-8 h-8 text-lime-600" />
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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-lime-600" />
          <h1 className="text-lg font-bold text-slate-800">Nhật ký canh tác</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
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
                <Leaf className="w-8 h-8 text-lime-600" />
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
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        <div className="md:hidden h-14"></div> {/* Spacer for mobile header */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

