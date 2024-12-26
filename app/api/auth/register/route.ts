import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Giả lập "database" dạng mảng. Khi làm thực tế thì thay bằng DB thật.
const users: { id: number; username: string; password: string }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Thiếu username hoặc password" },
        { status: 400 }
      );
    }

    // Kiểm tra user đã tồn tại chưa
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { message: "Username đã tồn tại" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      id: Date.now(), // tạm dùng Date.now() làm ID
      username,
      password: hashedPassword,
    };

    users.push(newUser);

    return NextResponse.json(
      { message: "Tạo tài khoản thành công", userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tạo tài khoản" },
      { status: 500 }
    );
  }
}
