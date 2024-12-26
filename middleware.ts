// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';

// Danh sách các đường dẫn cần xác thực
const PROTECTED_PATHS = ['/api/protected', '/api/user', '/api/secret'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Chỉ chặn các đường dẫn PROTECTED_PATHS
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    // Lấy token từ header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Thiếu Authorization header (middleware)' },
        { status: 401 },
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Không tìm thấy token (middleware)' },
        { status: 401 },
      );
    }

    // Kiểm tra token
    const decoded = verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc hết hạn (middleware)' },
        { status: 401 },
      );
    }

    // Token hợp lệ => cho phép đi tiếp
    // Nếu muốn truyền thông tin user xuống route, ta có thể dùng request.headers,...
  }

  // Các route còn lại thì không cần kiểm tra
  return NextResponse.next();
}

// Config để middleware apply cho tất cả routes trong app
export const config = {
  matcher: ['/api/:path*'], // Chặn tất cả /api/*
};
