import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  // Xoá cookie token
  const response = NextResponse.json({ message: "Đã logout" });
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    maxAge: 0, // xoá cookie
    path: "/",
  });
  return response;
}
