import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Lấy token từ cookie
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    // Xác thực token
    const decoded = verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // Nếu xác thực thành công, tiếp tục logic của bạn
    // Ví dụ: truy cập DB, trả về data, v.v.
    return NextResponse.json({
      message: "Truy cập hợp lệ",
      user: decoded,
      data: "Dữ liệu bảo mật... (ví dụ)",
    });
  } catch (error: any) {
    console.error("Protected route error:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}
