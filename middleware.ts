import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // At this point, the token is valid — the user is authenticated.
    // You can add role checks, subscription checks, etc. here in the future.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to allow, false to redirect to the login page
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Only protect these routes — public pages and API auth routes are excluded
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/profile/:path*",
    "/api/links/:path*",
  ],
};