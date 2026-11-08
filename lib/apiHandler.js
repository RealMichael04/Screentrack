import "server-only";
import { getCurrentUser } from "./auth/server";
import { ApiError } from "./apiError.js";

export const fail = (message, status, extra) => Response.json({ error: message, ...extra }, { status });

/** Wraps an API route: requires sign-in and turns errors into safe responses. */
export function withUser(handler) {
  return async (request, context) => {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in first.", 401);
    try {
      return await handler(request, user, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.status, { suggestions: error.suggestions });
      }
      console.error("Schedule request failed:", error.message);
      return fail("Something went wrong on our side. Please try again.", 502);
    }
  };
}
