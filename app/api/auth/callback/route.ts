import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, setAuthCookies } from "@insforge/sdk/ssr";

const OAUTH_PKCE_COOKIE_NAME = "jobpilot_oauth_pkce_verifier";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("insforge_code");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = requestedNext?.startsWith("/") ? requestedNext : "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get(OAUTH_PKCE_COOKIE_NAME)?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL("/login?error=OAuth session expired", request.url),
      );
    }

    const insforge = createServerClient({ cookies: cookieStore });

    const { data, error } = await insforge.auth.exchangeOAuthCode(
      code,
      codeVerifier,
    );

    if (!error && data?.accessToken && data?.refreshToken) {
      const response = NextResponse.redirect(new URL(next, request.url));

      setAuthCookies(response.cookies, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      response.cookies.delete(OAUTH_PKCE_COOKIE_NAME);
      return response;
    }

    console.error("[auth/callback] OAuth exchange failed:", error?.message);
  }

  return NextResponse.redirect(
    new URL("/login?error=OAuth exchange failed", request.url),
  );
}
