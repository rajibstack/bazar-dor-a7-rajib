import { betterAuthViewSession } from "better-auth/next-js";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const path = request.nextUrl.pathname;

  const isProductDetailsPage =
    path.startsWith("/products/") || path.startsWith("/product/");

  if (isProductDetailsPage) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:path*", "/product/:path*"],
};
