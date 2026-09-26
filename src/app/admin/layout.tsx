import { StaffShell } from "@/components/staff/StaffShell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <StaffShell role="admin">{children}</StaffShell>;
}
