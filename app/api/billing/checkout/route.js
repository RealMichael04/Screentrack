import { withUser } from "@/lib/apiHandler";
import { createCheckout } from "@/lib/billing";

export const POST = withUser(async (request, user) => {
  const url = await createCheckout(user, new URL(request.url).origin);
  return Response.json({ url });
});
