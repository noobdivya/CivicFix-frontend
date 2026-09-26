import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/staff/LoginForm";

export const metadata: Metadata = {
  title: "Staff login — CivicFix",
  description: "Sign in to the CivicFix department, field worker or admin portal.",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
