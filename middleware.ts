import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // This callback is called when the user is authenticated
    // You can add custom logic here, e.g., role-based access control
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If there is a token, the user is authorized
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)',
  ],
};
