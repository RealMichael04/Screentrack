import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";

// Protects /account: signed-out visitors are sent to the sign-in page.
export default async function proxy(request) {
  const auth = getAuth();
  if (!auth) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
  return auth.middleware({ loginUrl: "/auth/sign-in" })(request);
}

export const config = {
  matcher: ["/account/:path*", "/recommend/:path*", "/schedule/:path*", "/track/:path*", "/calendar/:path*"],
};
