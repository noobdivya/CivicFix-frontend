import type { Metadata } from "next";
import { QueuePage } from "@/components/staff/QueuePage";

export const metadata: Metadata = { title: "Department Portal — CivicFix" };

export default function DepartmentPage() {
  return <QueuePage role="department" />;
}
