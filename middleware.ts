import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRole } from "@/lib/auth";

export async function middleware(request) {
  const session = await auth();

  // Check if the path starts with /owner
  if (request.nextUrl.pathname.startsWith("/owner")) {
    if (!session || !session.user?.email) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }

    // Check if user has owner role
    const userRole = await getUserRole(session.user.email);
    if (userRole !== "owner") {
      // Redirect unauthorized users to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*"],
};
