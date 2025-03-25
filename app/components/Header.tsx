"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChartBarIcon,
  ContactIcon,
  LayoutDashboardIcon,
  Settings,
  UserIcon,
  UtilityPoleIcon,
} from "lucide-react"

const Header = () => {
  const [activeLink, setActiveLink] = useState("/")
  const [scrollActive, setScrollActive] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Giả sử role lưu trong localStorage, nếu từ API thì dùng fetch/axios
    const role = localStorage.getItem("userRole") // Hoặc lấy từ Redux, Zustand...
    setUserRole(role)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollActive(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Danh sách link
  const navItems = [
    {
      href: "/nhatky",
      label: "Nhật ký",
      icon: <LayoutDashboardIcon className="w-5 h-5" />,
    },
    {
      href: "/danhmuc",
      label: "Mùa vụ",
      icon: <ContactIcon className="w-5 h-5" />,
    },
    {
      href: "/vattu",
      label: "Vật tư",
      icon: <ContactIcon className="w-5 h-5" />,
    },
    {
      href: "/statistics",
      label: "Thống kê",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    {
      href: "/ultilities",
      label: "Tiện ích",
      icon: <UtilityPoleIcon className="w-5 h-5" />,
    },
    {
      href: "/profile",
      label: "Người dùng",
      icon: <UserIcon className="w-5 h-5" />,
    },
  ]

  // Nếu role là "admin", thêm route /admin
  // if (userRole === "admin") {
  //   navItems.push({
  //     href: "/admin",
  //     label: "Quản trị",
  //     icon: <Settings className="w-5 h-5" />,
  //   })
  // }
    navItems.push({
      href: "/admin",
      label: "Quản trị",
      icon: <Settings className="w-5 h-5" />,
    })
  

  return (
    <>
      {/* Nav cho Desktop (lg trở lên) */}
      <nav
        className={`hidden lg:block w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrollActive
            ? "shadow-md bg-white/70 backdrop-blur-md"
            : "bg-white/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 flex justify-between items-center">
          <div
            className="text-2xl font-bold bg-clip-text text-transparent
                       bg-gradient-to-r from-amber-600 to-lime-600
                       transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            Nhật ký sản xuất
          </div>

          {/* Menu items */}
          <ul className="flex gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setActiveLink(item.href)}
                  className={`group font-medium transition-colors flex items-center gap-1 ${
                    activeLink === item.href
                      ? "text-lime-700"
                      : "text-slate-700 hover:text-lime-700"
                  }`}
                >
                  <span className="relative">
                    {item.icon}
                    <span
                      className="absolute left-0 bottom-0 w-0 h-[2px] bg-lime-600
                               transition-all duration-300 group-hover:w-full"
                    ></span>
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Nav cho Mobile */}
      <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-50 bg-white/80 shadow-2xl backdrop-blur-md">
        <ul className="flex w-full justify-between items-center px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActiveLink(item.href)}
              className={
                "flex flex-col items-center justify-center py-2 w-full text-xs font-medium border-t-2 transition-all " +
                (activeLink === item.href
                  ? "border-lime-600 text-lime-700"
                  : "border-transparent text-slate-700 hover:text-lime-700")
              }
            >
              <div
                className={
                  activeLink === item.href ? "mb-1 transform scale-110" : "mb-1"
                }
              >
                {item.icon}
              </div>
              {item.label}
            </Link>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default Header
