import BillingButton from "./BillingButton";

const PERKS = [
  "Day-by-day plans built around your availability",
  "Story order for movie franchises",
  "Change your plan in plain English",
];

export default function UpgradeCard({ offer, compact = false }) {
  return (
    <section className={`survey upgrade ${compact ? "upgrade--compact" : ""}`} aria-label="Upgrade to Premium">
      <span className="pill pill--red">ReelGuide Premium</span>
      <h2>{compact ? "Change this plan with AI" : "Unlock AI viewing schedules"}</h2>
      {offer?.priceLabel && <p className="upgrade__price">{offer.priceLabel}</p>}
      {!compact && (
        <ul className="upgrade__perks">
          {PERKS.map((perk) => <li key={perk}>{perk}</li>)}
        </ul>
      )}
      <BillingButton
        endpoint="/api/billing/checkout"
        label="Upgrade to Premium"
        pendingLabel="Opening checkout…"
        className="btn btn--primary upgrade__button"
      />
      <p className="muted small">Cancel anytime. Payments are handled securely by Stripe.</p>
      {offer?.testMode && (
        <p className="auth__notice upgrade__test">
          Test mode: no real money is charged. Pay with card 4242 4242 4242 4242, any future expiry date and any CVC.
        </p>
      )}
    </section>
  );
}
