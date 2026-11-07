import { getAuth } from "@/lib/auth/server";

// Proxies every /api/auth/* request to Neon Auth.
function forward(method) {
  return async (request, context) => {
    const auth = getAuth();
    if (!auth) {
      return Response.json(
        { error: "Sign-in isn't configured yet. Add the Neon Auth environment variables." },
        { status: 503 }
      );
    }
    return auth.handler()[method](request, context);
  };
}

export const GET = forward("GET");
export const POST = forward("POST");
export const PUT = forward("PUT");
export const PATCH = forward("PATCH");
export const DELETE = forward("DELETE");
