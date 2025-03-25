"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf } from "lucide-react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { UserAuthForm } from "./signin-auth-form"
import { UserSignUpForm } from "./signup-auth-form"

export default function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoogleAuth = async () => {
    await signIn("google", { 
      callbackUrl: "/complete-profile", 
      redirect: true
    })
  }

  if (!mounted) return null

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-lime-50 via-white to-green-50">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/90 to-green-600/90 z-10" />
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[url('/pattern.png')] bg-repeat" />
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm">
              <Leaf className="w-12 h-12 text-lime-200" />
            </div>
            <h1 className="text-5xl font-bold mb-6 tracking-tight">Nhật ký canh tác</h1>
            <p className="text-xl text-lime-100 max-w-md">
              Giải pháp quản lý nông nghiệp thông minh, hiện đại và bền vững
            </p>
            <div className="mt-12">
              <Image
                src={isLogin ? "/login-illustration.png" : "/signup-illustration.png"}
                alt="Illustration"
                width={450}
                height={450}
                className="mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="p-3 bg-lime-100 rounded-full">
              <Leaf className="w-10 h-10 text-lime-700" />
            </div>
          </div>

          {error === 'ACCOUNT_PENDING_ACTIVATION' && (
            <Alert variant="warning" className="mb-6">
              <AlertDescription>
                Tài khoản của bạn đang chờ admin kích hoạt. Vui lòng liên hệ quản trị viên để được kích hoạt.
              </AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {isLogin ? "Đăng nhập" : "Đăng ký"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isLogin ? "Chào mừng bạn trở lại" : "Tạo tài khoản để bắt đầu"}
                </p>
              </div>

              {isLogin ? <UserAuthForm /> : <UserSignUpForm setIsLogin={setIsLogin} />}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
                onClick={handleGoogleAuth}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  {/* ... giữ nguyên SVG Google ... */}
                </svg>
                Google
              </Button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 text-lime-700 hover:text-lime-800 font-medium"
                  >
                    {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                  </button>
                </p>s
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}