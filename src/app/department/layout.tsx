import { StaffShell } from "@/components/staff/StaffShell";

export default function DepartmentLayout({ children }: LayoutProps<"/department">) {
  return <StaffShell role="department">{children}</StaffShell>;
}
