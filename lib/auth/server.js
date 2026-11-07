import { createNeonAuth } from "@neon/auth/next/server";

// Neon Auth needs two environment variables (see README):
//   NEON_AUTH_BASE_URL       – the Auth URL from the Neon console
//   NEON_AUTH_COOKIE_SECRET  – a random string of 32+ characters
// The instance is created lazily so the landing page still builds and runs
// before those values are added.
let instance = null;

export function isAuthConfigured() {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || "";
  return Boolean(process.env.NEON_AUTH_BASE_URL) && secret.length >= 32;
}

export function getAuth() {
  if (!isAuthConfigured()) return null;
  if (!instance) {
    instance = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET },
    });
  }
  return instance;
}

/** Returns the signed-in user, or null (also null when auth isn't configured). */
export async function getCurrentUser() {
  const auth = getAuth();
  if (!auth) return null;
  try {
    const { data } = await auth.getSession();
    return data?.user ?? null;
  } catch {
    return null;
  }
}
