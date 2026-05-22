import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}

function AuthFallback() {
  return <div className="mx-auto h-96 max-w-md animate-pulse rounded-lg border border-slate-200 bg-white" />;
}
