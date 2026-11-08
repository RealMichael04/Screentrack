"use client";

import { useState } from "react";

/** Asks the server for a Stripe page, then sends the person there. */
export default function BillingButton({ endpoint, label, pendingLabel, className }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const go = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(endpoint, { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      window.location.assign(json.url);
    } catch (e) {
      setError(e.message || "We couldn't reach Stripe. Please try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={go} disabled={busy}>
        {busy ? pendingLabel : label}
      </button>
      {error && <p className="auth__error live-message" role="alert">{error}</p>}
    </>
  );
}
