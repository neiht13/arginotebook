"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  ContactIcon,
  LayoutDashboardIcon,
  UserIcon,
} from "lucide-react";

const Header = () => {
  const [activeLink, setActiveLink] = useState("/");
  const [scrollActive, setScrollActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollActive(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Danh sách link
  const navItems = [
    { href: "/timeline", label: "Nhật ký", icon: <LayoutDashboardIcon className="w-5 h-5"/> },
    { href: "/category", label: "Danh mục", icon: <ContactIcon  className="w-5 h-5"/> },
    { href: "/thongke", label: "Thống kê", icon: <ChartBarIcon  className="w-5 h-5"/> },
    { href: "/user", label: "Người dùng", icon: <UserIcon  className="w-5 h-5"/> },
  ];

  return (
    <>
      {/* Nav cho Desktop (lg trở lên) */}
      <nav
        className={`hidden lg:block w-full fixed top-0 left-0 z-50 transition-all ${
          scrollActive ? "shadow-md bg-background" : "bg-background"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo hoặc brand name */}
          <div className="text-xl font-bold text-orange-500">MyApp Logo</div>
          
          {/* Menu items */}
          <ul className="flex gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setActiveLink(item.href)}
                  className={`font-medium transition-colors ${
                    activeLink === item.href
                      ? "text-orange-500"
                      : "text-gray-600 hover:text-orange-500"
                  }`}
                >
                 <div className="flex gap-2">{item.icon} {item.label} </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Nav cho Mobile (dưới cùng) */}
      <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-50 bg-background shadow-2xl">
        <ul className="flex w-full justify-between items-center px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActiveLink(item.href)}
              className={
                "flex flex-col items-center justify-center py-2 w-full text-xs border-t-2 transition-all " +
                (activeLink === item.href
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-700 hover:text-orange-500")
              }
            >
              <div
                className={
                  activeLink === item.href
                    ? "transform scale-115 mb-1 "
                    : "mb-1"
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
  );
};

export default Header;