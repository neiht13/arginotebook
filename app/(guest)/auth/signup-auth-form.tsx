// components/user-signup-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";

export function UserSignUpForm({ className, setIsLogin, ...props }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    xId: "", // Đơn vị
  });
  const { units, fetchUnits } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchUnits(); // Lấy danh sách đơn vị khi component mount
  }, [fetchUnits]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mật khẩu không khớp",
      });
      return;
    }

    if (!form.xId) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn đơn vị",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/signup", {
        email: form.email,
        username: form.username,
        password: form.password,
        name: form.name,
        xId: form.xId,
      });

      toast({
        title: "Thành công",
        description: "Đăng ký thành công. Vui lòng chờ admin kích hoạt tài khoản.",
      });
      setIsLogin(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4 text-left", className)} {...props}>
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
        <div className="grid gap-1">
          <Input
            id="username"
            name="username"
            type="text"
            label="Tên đăng nhập"
            className="h-11"
            disabled={isLoading}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-1 relative">
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
            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="grid gap-1 relative">
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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-3 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="grid gap-1">
          <Input
            id="name"
            name="name"
            type="text"
            label="Họ tên"
            className="h-11"
            disabled={isLoading}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="xId">Đơn vị</Label>
          <Select
            value={form.xId}
            onValueChange={(value) => setForm({ ...form, xId: value })}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Chọn đơn vị" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit._id} value={unit._id}>
                  {unit.tendonvi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full bg-lime-600 text-white hover:bg-lime-700 transition-colors"
          disabled={isLoading}
          type="submit"
        >
          {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          Đăng ký
        </Button>
      </div>
    </form>
  );
}