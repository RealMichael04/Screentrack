import "server-only";
import Stripe from "stripe";
import { ApiError } from "./apiError.js";
import { getDb } from "./db.js";

const ACTIVE_STATUSES = ["active", "trialing"];

let client = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set.");
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 1, timeout: 20_000 });
  }
  return client;
}

const isActive = (status) => ACTIVE_STATUSES.includes(status);

async function loadRow(userId) {
  const sql = getDb();
  const [row] = await sql`select * from subscriptions where user_id = ${userId}`;
  return row ?? null;
}

/** This person's plan, read from our database. */
export async function getPlan(userId) {
  const row = await loadRow(userId);
  return {
    isPremium: row ? isActive(row.status) : false,
    status: row?.status ?? null,
    periodEnd: row?.current_period_end ? new Date(row.current_period_end).toISOString() : null,
    cancelAtPeriodEnd: row?.cancel_at_period_end ?? false,
    hasCustomer: Boolean(row),
  };
}

/** Blocks a paid action on the server, so it can't be bypassed from the browser. */
export async function requirePremium(userId) {
  const { isPremium } = await getPlan(userId);
  if (!isPremium) {
    throw new ApiError(402, "AI schedules are a Premium feature. Upgrade to build or change a schedule.");
  }
}

/** The price to show on the upgrade card, read from Stripe so it can't go out of date. */
export async function getOffer() {
  const testMode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
  try {
    const price = await getStripe().prices.retrieve(process.env.STRIPE_PRICE_ID);
    const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency }).format(price.unit_amount / 100);
    return { priceLabel: `${amount} / ${price.recurring?.interval ?? "month"}`, testMode };
  } catch {
    return { priceLabel: null, testMode };
  }
}

/** Newer Stripe API versions keep the billing period on the subscription's item. */
function periodEndOf(subscription) {
  const seconds = subscription.items?.data?.[0]?.current_period_end ?? subscription.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function saveSubscription(subscription, knownUserId) {
  const sql = getDb();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  let userId = knownUserId ?? subscription.metadata?.userId;
  if (!userId) {
    const [row] = await sql`select user_id from subscriptions where stripe_customer_id = ${customerId}`;
    userId = row?.user_id;
  }
  if (!userId) {
    console.warn("Stripe subscription has no matching user:", subscription.id);
    return;
  }

  // A late update about an old subscription must not overwrite a newer active one.
  await sql`
    insert into subscriptions
      (user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, cancel_at_period_end, updated_at)
    values
      (${userId}, ${customerId}, ${subscription.id}, ${subscription.status}, ${periodEndOf(subscription)},
       ${subscription.cancel_at_period_end}, now())
    on conflict (user_id) do update set
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_subscription_id = excluded.stripe_subscription_id,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      updated_at = now()
    where subscriptions.stripe_subscription_id = excluded.stripe_subscription_id
       or excluded.status in ('active', 'trialing')
  `;
}

export async function createCheckout(user, origin) {
  const row = await loadRow(user.id);
  if (row && isActive(row.status)) throw new ApiError(409, "You already have Premium.");

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id } },
    ...(row ? { customer: row.stripe_customer_id } : { customer_email: user.email }),
    success_url: `${origin}/schedule?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/schedule`,
  });
  return session.url;
}

export async function createPortal(userId, origin) {
  const row = await loadRow(userId);
  if (!row) throw new ApiError(404, "You don't have a subscription to manage yet.");
  const session = await getStripe().billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${origin}/account?billing=updated`,
  });
  return session.url;
}

/**
 * Records a finished checkout as soon as the person returns from Stripe,
 * so they aren't left waiting on the webhook. Only their own session counts.
 */
export async function confirmCheckout(userId, sessionId) {
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) return;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.client_reference_id !== userId || !session.subscription) return;
  const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  await saveSubscription(await stripe.subscriptions.retrieve(id), userId);
}

/** Re-reads this person's subscription from Stripe. */
export async function refreshSubscription(userId) {
  const row = await loadRow(userId);
  if (!row) return;
  await saveSubscription(await getStripe().subscriptions.retrieve(row.stripe_subscription_id), userId);
}

/** Checks that a webhook really came from Stripe, then applies it. */
export function verifyWebhook(payload, signature, secret) {
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

export async function handleStripeEvent(event) {
  const stripe = getStripe();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.mode !== "subscription" || !session.subscription) return;
    const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    await saveSubscription(await stripe.subscriptions.retrieve(id), session.client_reference_id ?? undefined);
    return;
  }

  if (event.type.startsWith("customer.subscription.")) {
    // Webhooks can arrive out of order, so always read the current state.
    const subscription = await stripe.subscriptions.retrieve(event.data.object.id);
    await saveSubscription(subscription);
  }
}
