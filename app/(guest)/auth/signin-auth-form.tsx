"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-toastify"
import Spinner from "@/components/ui/spinner"

export function UserAuthForm({ className, ...props }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [form, setForm] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [remember, setRemember] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        ...form,
        redirect: false,
      })

      if (result?.ok) {
        toast.success("Đăng nhập thành công")
        router.push("/timeline")
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    if (remember) {
      localStorage.setItem("remember", "true")
    } else {
      localStorage.removeItem("remember")
    }
  }, [remember])

  useEffect(() => {
    if (localStorage.getItem("remember") === "true") {
      setRemember(true)
    }
  }, [])

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} {...props}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Tên đăng nhập
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              id="username"
              name="username"
              type="text"
              className="pl-10 h-11"
              autoComplete="username"
              disabled={isLoading}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </Label>
            <a href="/forgot-password" className="text-xs text-lime-700 hover:text-lime-800 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LockIcon className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              id="password"
              name="password"
              className="pl-10 h-11"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isLoading}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={() => setRemember(!remember)} />
          <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">
            Ghi nhớ đăng nhập
          </Label>
        </div>

        <Button className="w-full h-11 bg-lime-600 hover:bg-lime-700 text-white" disabled={isLoading} type="submit">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Spinner className="w-5 h-5 mr-2" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </div>
    </form>
  )
}

