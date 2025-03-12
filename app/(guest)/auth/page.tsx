// pages/authentication/index.tsx (hoặc đường dẫn tương ứng)
"use client"
import Image from "next/image";
import { useState } from "react";

import { UserAuthForm } from "./signin-auth-form";
import { UserSignUpForm } from "./signup-auth-form";


export default function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Bên trái với hình ảnh minh họa */}
      <div className="hidden lg:flex w-1/2 text-primary items-center justify-center">
        <Image
          src={isLogin  ? "/login.svg" : "/signup.svg"} // Thay thế bằng đường dẫn hình ảnh của bạn
          alt="Hình minh họa"
          width={600}
          height={600}
          className="object-contain"
        />
      </div>

      {/* Bên phải với form đăng nhập/đăng ký */}
      <div className="flex w-full lg:w-1/2 items-center justify-center">
        <div className="w-full max-w-md p-6">
          <div className="flex flex-col space-y-6 text-center">
            <h1 className="text-3xl font-bold text-slate-800">
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </h1>
            <p className="text-sm text-slate-600">
              {isLogin
                ? "Sử dụng email và mật khẩu của bạn để đăng nhập"
                : "Tạo tài khoản mới bằng email của bạn"}
            </p>

            {/* Nút chuyển đổi giữa Đăng nhập và Đăng ký
            <div className="flex justify-center space-x-4 my-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded ${
                  isLogin
                    ? "bg-lime-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded ${
                  !isLogin
                    ? "bg-lime-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                Đăng ký
              </button>
            </div> */}

            {/* Hiển thị form tương ứng */}

            {
            //@ts-ignore
            isLogin ? <UserAuthForm /> : <UserSignUpForm setIsLogin= {setIsLogin}/>}

            {/* Liên kết chuyển đổi dưới form */}
            {isLogin ? (
              <p className="text-sm text-slate-600">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-lime-600 hover:underline"
                >
                  Đăng ký
                </button>
                .
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-lime-600 hover:underline"
                >
                  Đăng nhập
                </button>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
