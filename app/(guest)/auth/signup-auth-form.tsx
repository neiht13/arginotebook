// components/user-signup-form.tsx

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";

//@ts-ignore
export function UserSignUpForm({ className, ...props }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setIsLogin } = props
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mật khẩu không khớp",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/signup", {
        email: form.email,
        password: form.password,
      });

      toast({
        title: "Thành công",
        description: "Tạo tài khoản thành công.",
      });
      setIsLogin(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng sử dụng email khác.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4 text-left", className)}
      {...props}
    >
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            className="h-11"
            autoComplete="email"
            disabled={isLoading}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-1 relative">
          {/* <Label htmlFor="password">Mật khẩu</Label> */}
          <Input
            id="password"
            name="password"
            label="Mật khẩu"
            placeholder="********"
            className="h-11"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={isLoading}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-3 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="grid gap-1 relative">
          {/* <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label> */}
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="********"
            className="h-11"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={isLoading}
            onChange={handleChange}
            required
          /><button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-3 text-slate-500 hover:text-slate-700"
        >
          {showPassword ? (
            <EyeOffIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
        </div>
        <Button
          className="w-full bg-lime-600 text-white hover:bg-lime-700 transition-colors"
          disabled={isLoading}
          type="submit"
        >
          {isLoading && (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Đăng ký
        </Button>
      </div>
    </form>
  );
}
