import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@insforge/sdk/ssr';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url), {
    status: 303,
  });

  // Directly clear the auth cookies on the response so the
  // Set-Cookie headers are sent and the browser drops the tokens.
  clearAuthCookies(response.cookies);

  return response;
}
