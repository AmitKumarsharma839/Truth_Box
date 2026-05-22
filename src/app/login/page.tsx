import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

function AuthFallback() {
  return <div className="mx-auto h-80 max-w-md animate-pulse rounded-lg border border-slate-200 bg-white" />;
}
