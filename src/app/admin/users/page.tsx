import type { Metadata } from "next";
import { UserManagement } from "@/components/admin/UserManagement";

export const metadata: Metadata = { title: "Staff — CivicFix Admin" };

export default function AdminUsersPage() {
  return <UserManagement />;
}
