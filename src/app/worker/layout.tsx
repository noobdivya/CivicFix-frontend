import { StaffShell } from "@/components/staff/StaffShell";

export default function WorkerLayout({ children }: LayoutProps<"/worker">) {
  return <StaffShell role="worker">{children}</StaffShell>;
}
