// components/user-auth-form.tsx

"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

//@ts-ignore
export function UserAuthForm({ className, ...props }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await handleLogin();
    setIsLoading(false)
    
  };
  async function handleLogin() {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log(res);
      
      if (res.ok) {
        toast({
          title: "Thành công",
          description: "Đăng nhập thành công.",
        });
        router.push("/timeline");
      } else {
        toast({
          title: "Đăng nhập thất bại",
          variant: "destructive",
          description: "Đăng nhập thất bại",
        });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      alert("Có lỗi xảy ra.");
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    if (remember) {
      localStorage.setItem('remember', 'true');
    } else {
      localStorage.removeItem('remember');
    }
  }, [remember])
  
  useEffect(() => {
    if (localStorage.getItem('remember') === 'true') {
      setRemember(true);
    }
  }, []);

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4 text-left", className)}
      {...props}
      
    >
      <div className="grid gap-4">
        <div className="grid gap-1">
          {/* <Label htmlFor="email">Email</Label> */}
          <Input
            id="username"
            name="username"
            label="Username"
            type="text"
            className="h-11"
            autoComplete="email"
            disabled={isLoading}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-1 relative">
          {/* <Label htmlFor="password">Mật khẩu</Label> */}
          <Input
            id="password"
            name="password"
            className="h-11"
            label="Mật khẩu"
            placeholder="********"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isLoading}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              name="remember"
              checked={remember}
              onCheckedChange={() => setRemember(!remember)}
              className="h-4 w-4 text-blue-600"
            />
            <Label htmlFor="remember" className="text-sm">
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>
        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          disabled={isLoading}
          type="submit"
        >
          {isLoading && (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Đăng nhập
        </Button>
      </div>
    </form>
  );
}
