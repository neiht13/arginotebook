import { NextRequest, NextResponse } from "next/server";
import { signJwtToken } from "@/lib/jwt";
import { connectToDatabaseLink } from "@/lib/mongodb";

// Giả lập "database" dạng mảng. Trong thực tế thay bằng DB thật.
const users: { id: number; username: string; password: string }[] = [
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Thiếu username hoặc password" },
        { status: 400 }
      );
    }
    const { db } = await connectToDatabaseLink();

    const user = await db.collection('account').findOne({
        username: username,
        password: password,
      });
    if (!user) {
      return NextResponse.json(
        { message: "Sai username hoặc password" },
        { status: 401 }
      );
    }


    // Tạo token và lưu vào cookie HttpOnly
    const token = signJwtToken({ id: user.id, username: user.username });

    const response = NextResponse.json({ message: "Đăng nhập thành công" });
    // Thiết lập cookie HttpOnly, Secure (nên bật Secure = true trên môi trường production)
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi đăng nhập" },
      { status: 500 }
    );
  }
}
