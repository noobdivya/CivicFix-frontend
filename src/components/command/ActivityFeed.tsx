import { CheckCircle2, FilePlus2 } from "lucide-react";
import type { DashboardData } from "@/lib/api";
import { timeAgo } from "@/lib/status";
import { EmptyChart, Panel } from "./Panel";

export function ActivityFeed({ activity }: { activity: DashboardData["activity"] }) {
  return (
    <Panel title="Alerts & activity">
      {activity.length === 0 ? (
        <EmptyChart>No activity yet. Updates appear here as issues are reported and fixed.</EmptyChart>
      ) : (
        <ul className="divide-y divide-line">
          {activity.map((a) => {
            const resolved = a.type === "resolved";
            const Icon = resolved ? CheckCircle2 : FilePlus2;
            return (
              <li key={`${a.type}-${a.issueId}`} className="flex items-start gap-3 py-2.5">
                <Icon className={`mt-0.5 size-4 shrink-0 ${resolved ? "text-st-resolved" : "text-st-reported"}`} />
                <p className="min-w-0 flex-1 text-sm text-fg">
                  <span className="text-muted">{resolved ? "Resolved:" : "New report:"}</span>{" "}
                  <span className="break-words">{a.title}</span>
                  {a.address && <span className="text-muted"> · {a.address}</span>}
                </p>
                <span className="shrink-0 whitespace-nowrap text-xs text-subtle">{timeAgo(a.at)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
