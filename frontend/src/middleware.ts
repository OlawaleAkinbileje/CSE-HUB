import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/student/search") {
    return NextResponse.redirect(new URL(`/search${request.nextUrl.search}`, request.url));
  }

  // Protect student dashboard routes
  if (pathname.startsWith("/student") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect staff dashboard routes
  if (pathname.startsWith("/staff")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (userRole !== "staff" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Protect admin dashboard routes
  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/staff/:path*", "/admin/:path*"],
};
