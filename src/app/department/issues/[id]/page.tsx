import { IssueDetailView } from "@/components/staff/IssueDetailView";

export default async function DepartmentIssuePage({ params }: PageProps<"/department/issues/[id]">) {
  const { id } = await params;
  return <IssueDetailView id={Number(id)} role="department" />;
}
