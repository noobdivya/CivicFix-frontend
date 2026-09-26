import { IssueDetailView } from "@/components/staff/IssueDetailView";

export default async function AdminIssuePage({ params }: PageProps<"/admin/issues/[id]">) {
  const { id } = await params;
  return <IssueDetailView id={Number(id)} role="admin" />;
}
