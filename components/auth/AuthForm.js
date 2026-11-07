"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogoMark } from "@/components/Logo";
import { signInWithEmail, signUpWithEmail } from "@/app/auth/actions";

const copy = {
  "sign-in": {
    title: "Welcome back",
    sub: "Sign in to pick up where you left off.",
    button: "Sign in",
    pending: "Signing in…",
    switchText: "New to ReelGuide?",
    switchLink: "Create an account",
    switchHref: "/auth/sign-up",
  },
  "sign-up": {
    title: "Create your account",
    sub: "Start tracking everything you watch, all in one place.",
    button: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/auth/sign-in",
  },
};

export default function AuthForm({ mode, configured }) {
  const action = mode === "sign-up" ? signUpWithEmail : signInWithEmail;
  const [state, formAction, isPending] = useActionState(action, null);
  const t = copy[mode];

  return (
    <main className="auth">
      <div className="auth__glow" aria-hidden="true" />
      <div className="auth__card">
        <Link href="/" className="auth__brand" aria-label="ReelGuide home">
          <LogoMark />
          <span className="logo__text">Reel<span>Guide</span></span>
        </Link>
        <h1>{t.title}</h1>
        <p className="muted">{t.sub}</p>

        {!configured && (
          <p className="auth__notice" role="status">
            Sign-in is coming soon. The account system isn&apos;t connected yet.
          </p>
        )}

        <form action={formAction} className="auth__form">
          {mode === "sign-up" && (
            <label>
              <span>Name</span>
              <input name="name" type="text" autoComplete="name" required placeholder="Your name" />
            </label>
          )}
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={mode === "sign-up" ? 8 : undefined}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}
            />
          </label>

          {state?.error && <p className="auth__error" role="alert">{state.error}</p>}

          <button type="submit" className="btn btn--primary btn--large auth__submit" disabled={isPending}>
            {isPending ? t.pending : t.button}
          </button>
        </form>

        <p className="auth__switch">
          {t.switchText} <Link href={t.switchHref}>{t.switchLink}</Link>
        </p>
      </div>
    </main>
  );
}
