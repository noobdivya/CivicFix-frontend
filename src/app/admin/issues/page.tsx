import type { Metadata } from "next";
import { QueuePage } from "@/components/staff/QueuePage";

export const metadata: Metadata = { title: "All Issues — CivicFix Admin" };

export default function AdminIssuesPage() {
  return <QueuePage role="admin" />;
}
