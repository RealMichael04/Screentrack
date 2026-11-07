import AuthForm from "@/components/auth/AuthForm";
import { isAuthConfigured } from "@/lib/auth/server";

export const metadata = { title: "Sign in — ReelGuide" };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return <AuthForm mode="sign-in" configured={isAuthConfigured()} />;
}
