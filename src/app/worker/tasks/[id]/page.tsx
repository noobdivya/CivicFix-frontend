import { IssueDetailView } from "@/components/staff/IssueDetailView";

export default async function WorkerTaskPage({ params }: PageProps<"/worker/tasks/[id]">) {
  const { id } = await params;
  return <IssueDetailView id={Number(id)} role="worker" />;
}
