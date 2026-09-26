import type { Metadata } from "next";
import { ReportForm } from "@/components/report/ReportForm";

export const metadata: Metadata = {
  title: "Issue details — CivicFix",
  description: "Describe the civic issue, add a photo and pin its location.",
};

export default async function ReportCategoryPage({ params }: PageProps<"/report/[category]">) {
  const { category } = await params;
  return <ReportForm slug={category} />;
}
