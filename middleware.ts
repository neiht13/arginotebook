// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/auth";

export async function middleware(req: NextRequest) {
  const protectedPaths = ["/timeline", "/category"]

  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    const session = await getServerSession(authOptions)
    if (!session) {
      const loginUrl = new URL("/auth", req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}
