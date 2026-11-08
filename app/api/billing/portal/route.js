import { withUser } from "@/lib/apiHandler";
import { createPortal } from "@/lib/billing";

export const POST = withUser(async (request, user) => {
  const url = await createPortal(user.id, new URL(request.url).origin);
  return Response.json({ url });
});
