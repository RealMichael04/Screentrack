import { handleStripeEvent, verifyWebhook } from "@/lib/billing";

// Stripe calls this directly, so it has no signed-in user. The signature proves it's from Stripe.
export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook isn't configured." }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });

  // The signature covers the exact bytes sent, so the body must stay unparsed here.
  const payload = await request.text();
  let event;
  try {
    event = verifyWebhook(payload, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (error) {
    console.error("Stripe webhook failed:", error.message);
    // A failure status makes Stripe retry later.
    return Response.json({ error: "Webhook failed." }, { status: 500 });
  }
  return Response.json({ received: true });
}
