import { getServerSession } from "next-auth";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (special page for OG tags proxying)
     * 4. /_static (inside /public)
     * 5. /_vercel (Vercel internals)
     * 6. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
     */
    "/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {

  const path = req.nextUrl.pathname
  const nextToken = (await cookies()).get('next-auth.session-token')

  // @ts-ignore
  NextResponse.next()
  // const data = await d.json();
  // if (data?.originalUrl) {
  //   return NextResponse.redirect(data?.originalUrl)
  // } else {
  //   return NextResponse.redirect('localhost:3000')
  // }
  
  // if (
  //   !nextToken &&
  //   !path.startsWith('/auth')
  // ) {
  //   return NextResponse.redirect(new URL('/auth', req.nextUrl))
  // } 
  return NextResponse.next()


  //
  // // for API
  // if ("https://link.vnptdongthap.com.vn/api".includes(domain)) {
  //   return ApiMiddleware(req);
  // }
  //
  // // for Admin
  // if ("https://link.vnptdongthap.com.vn/admin".includes(domain)) {
  //   return AdminMiddleware(req);
  // }
}
