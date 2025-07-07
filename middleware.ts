import withAuth from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import path from "path";

// This function can be marked `async` if using `await` inside

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        if (
          pathname === "/login" ||
          pathname === "/register" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        if (pathname === "/" || pathname.startsWith("/api/video")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: "/about/:path*",
};
