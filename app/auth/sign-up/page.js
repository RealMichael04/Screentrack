import AuthForm from "@/components/auth/AuthForm";
import { isAuthConfigured } from "@/lib/auth/server";

export const metadata = { title: "Create account — ReelGuide" };
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return <AuthForm mode="sign-up" configured={isAuthConfigured()} />;
}
