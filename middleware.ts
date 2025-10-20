import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/public",
  "/assets",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth")?.value;

  // If no token, redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Verify token; if invalid, redirect to login
  try {
    const payload = await verifyAuthToken(token);
    const role = (payload as any).role || null;

    // If user visits root or login while authenticated, redirect based on role
    if (pathname === "/" || pathname === "/login") {
      const target = role === "super_admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Enforce role-based access
    const isAdminRoute = pathname.startsWith("/admin");
    const isUserDashboard = pathname.startsWith("/dashboard");

    // Non-super admins cannot access /admin
    if (isAdminRoute && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Super admins cannot access /dashboard; send them to /admin
    if (isUserDashboard && role === "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } catch {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};


