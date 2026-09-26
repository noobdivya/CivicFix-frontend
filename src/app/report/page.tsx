import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryPicker } from "@/components/report/CategoryPicker";
import { StepIndicator } from "@/components/report/StepIndicator";

export const metadata: Metadata = {
  title: "Report an issue — CivicFix",
  description: "Choose the type of civic issue you want to report.",
};

export default function ReportPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="mb-6 max-w-3xl">
        <StepIndicator current={1} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">What kind of issue are you reporting?</h1>
      <p className="mt-2 text-muted">Choose the category that best matches the problem. It goes straight to the department responsible.</p>
      <div className="mt-8">
        <CategoryPicker />
      </div>
    </div>
  );
}
