import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { accessToken } = await updateSession({
    requestCookies: request.cookies as any,
    responseCookies: response.cookies as any,
  });

  // Protected routes logic
  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/auth/callback";
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/profile") ||
    path.startsWith("/find-jobs");

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from auth pages (except callback which processes auth)
  if ((path === "/" || isAuthPage) && accessToken && path !== "/auth/callback") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
