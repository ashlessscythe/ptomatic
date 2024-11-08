import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserStatus } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to account-pending page for pending users
    if (path === "/account-pending") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      if (token.status !== UserStatus.PENDING) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Redirect pending users to account-pending page
    if (token?.status === UserStatus.PENDING && path !== "/auth/signin") {
      return NextResponse.redirect(new URL("/account-pending", req.url));
    }

    // Admin route protection
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Dashboard access only for active users
    if (path.startsWith("/dashboard")) {
      if (token?.status !== UserStatus.ACTIVE) {
        return NextResponse.redirect(new URL("/account-pending", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account-pending"],
};
