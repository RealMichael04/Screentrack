"use server";

import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/server";

const NOT_CONFIGURED = "Sign-in isn't set up yet. Add the Neon Auth keys to finish setup.";

export async function signUpWithEmail(_prev, formData) {
  const auth = getAuth();
  if (!auth) return { error: NOT_CONFIGURED };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !email) return { error: "Please enter your name and email." };
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };

  const { error } = await auth.signUp.email({ name, email, password });
  if (error) return { error: error.message || "Couldn't create your account. Try again." };

  redirect("/account");
}

export async function signInWithEmail(_prev, formData) {
  const auth = getAuth();
  if (!auth) return { error: NOT_CONFIGURED };

  const { error } = await auth.signIn.email({
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
  });
  if (error) return { error: error.message || "Wrong email or password. Try again." };

  redirect("/account");
}

export async function signOut() {
  const auth = getAuth();
  if (auth) await auth.signOut();
  redirect("/");
}
