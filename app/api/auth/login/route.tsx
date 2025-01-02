import { NextRequest, NextResponse } from "next/server";
import { signJwtToken } from "@/lib/jwt";
// @ts-ignore
import clientPromise from "@/mongo/client";

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
    // @ts-ignore
    const { db } = await clientPromise;

    const user = await db.collection('accountnew').findOne({
        username: username,
        password: password,
      });
    if (!user) {
      return NextResponse.json(
        { message: "Sai username hoặc password" },
        { status: 401 }
      );
    }
    const token = signJwtToken({ id: user.id, username: user.username });
    const response = NextResponse.json({ message: "Đăng nhập thành công" });
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
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi đăng nhập" },
      { status: 500 }
    );
  }
}
