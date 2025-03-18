"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf } from "lucide-react"

import { UserAuthForm } from "./signin-auth-form"
import { UserSignUpForm } from "./signup-auth-form"

export default function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-lime-50 to-green-100">
      {/* Left side with illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-lime-500 to-green-600 text-white p-8 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white rounded-full">
              <Leaf className="w-12 h-12 text-lime-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Nhật ký canh tác</h1>
          <p className="text-lg mb-8">
            Hệ thống quản lý hoạt động canh tác hiệu quả, giúp bạn theo dõi và tối ưu hóa quy trình sản xuất nông
            nghiệp.
          </p>

          <div className="mt-12">
            <Image
              src={isLogin ? "/login.svg" : "/signup.svg"}
              alt="Hình minh họa"
              width={400}
              height={400}
              className="mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden flex justify-center mb-8">
            <div className="p-3 bg-lime-100 rounded-full">
              <Leaf className="w-10 h-10 text-lime-600" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{isLogin ? "Đăng nhập" : "Đăng ký"}</h1>
                <p className="text-sm text-slate-600 mt-2">
                  {isLogin ? "Sử dụng tài khoản của bạn để đăng nhập" : "Tạo tài khoản mới để bắt đầu"}
                </p>
              </div>

              {isLogin ? <UserAuthForm /> : <UserSignUpForm setIsLogin={setIsLogin} />}

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-lime-600 hover:text-lime-700 font-medium hover:underline focus:outline-none"
                  >
                    {isLogin ? "Đăng ký" : "Đăng nhập"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

