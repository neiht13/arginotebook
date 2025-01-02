"use client";

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { signIn } from "next-auth/react"
import {toast} from "react-toastify";    // <-- import signIn

export function UserAuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Gọi signIn() của NextAuth, provider = "credentials"
    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,          // Không auto-redirect, ta xử lý thủ công
      callbackUrl: "/"  // Nơi ta muốn chuyển khi login thành công
    })

    setIsLoading(false)

    console.log('res', res)
    if (res?.ok) {
      toast.success("Đăng nhập thành công.",
      )
      router.push("/")
    } else {
      // Nếu thất bại
      toast({
        title: "Đăng nhập thất bại",
        variant: "destructive",
        description: "Sai username hoặc password",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div className="grid gap-4">
          {/* Username */}
          <div className="grid gap-1">
            <Input
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                disabled={isLoading}
                onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="grid gap-1 relative">
            <Input
                id="password"
                name="password"
                placeholder="********"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-3 text-slate-500"
            >
              {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
              ) : (
                  <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Checkbox ghi nhớ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                  id="remember"
                  name="remember"
                  checked={remember}
                  onCheckedChange={() => setRemember(!remember)}
                  className="h-4 w-4 text-lime-600"
              />
              <Label htmlFor="remember" className="text-sm">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <a
                href="/forgot-password"
                className="text-sm text-lime-600 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Button */}
          <Button
              className="w-full bg-lime-600 text-white hover:bg-lime-700 transition-colors"
              disabled={isLoading}
              type="submit"
          >
            {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </div>
      </form>
  )
}
