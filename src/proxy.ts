import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

function isSafeCallback(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("://");
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const isBlocked = (req.auth?.user as { blocked?: boolean } | undefined)?.blocked === true;

  // Blocked users should be forced to login even if JWT still valid (defense in depth, real check is in auth jwt callback)
  if (isBlocked) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("error", "blocked");
    return NextResponse.redirect(url);
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  const fullPath = pathname + search;
  const safeCallback = isSafeCallback(fullPath) ? fullPath : pathname;

  if (isAdminRoute && (!isLoggedIn || role !== "ADMIN")) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", safeCallback);
    return NextResponse.redirect(url);
  }

  if (isAccountRoute && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", safeCallback);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  // Hardened headers at edge (defense in depth, also set in next.config)
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
