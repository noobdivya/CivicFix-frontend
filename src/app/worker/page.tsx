import type { Metadata } from "next";
import { QueuePage } from "@/components/staff/QueuePage";

export const metadata: Metadata = { title: "My Tasks — CivicFix" };

export default function WorkerPage() {
  return <QueuePage role="worker" />;
}
