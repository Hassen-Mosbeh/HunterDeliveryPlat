import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/adminDashboard");

  const redirectToLogin = (reason: string) =>
    NextResponse.redirect(
      new URL(`/?authError=${encodeURIComponent(reason)}`, request.url),
    );

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return redirectToLogin("missing_token");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return redirectToLogin("missing_jwt_secret");
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const roleValue =
      typeof payload.role === "string" ? Number(payload.role) : payload.role;

    if (roleValue !== 0) {
      return redirectToLogin(`invalid_role_${payload.role}`);
    }

    return NextResponse.next();
  } catch (error) {
    return redirectToLogin(
      `jwt_verify_failed_${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}

export const config = {
  matcher: ["/adminDashboard/:path*"],
};
