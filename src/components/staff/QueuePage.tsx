"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth";
import { staffApi, type IssueFilters, type Role } from "@/lib/staff-api";
import { useApi } from "@/lib/use-api";
import { IssueList } from "./IssueList";
import { SummaryTiles } from "./SummaryTiles";

const heading: Record<Role, { title: string; text: string }> = {
  admin: { title: "All issues", text: "Every complaint across all departments." },
  department: { title: "Issue queue", text: "Review new complaints, set priorities and assign field workers." },
  worker: { title: "My tasks", text: "Issues assigned to you. Start work, post updates and upload completion proof." },
};

/** Summary tiles + issue list; clicking a tile filters the list. */
export function QueuePage({ role }: { role: Role }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<IssueFilters>({ status: role === "worker" ? "active" : "open", sort: "priority" });
  const { data: summary } = useApi(`summary-${JSON.stringify(filters)}`, () => staffApi.summary());
  const onFiltersChange = useCallback((f: IssueFilters) => setFilters(f), []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">{heading[role].title}</h1>
        <p className="mt-1 text-sm text-muted">
          {role === "department" && user?.departmentName ? `${user.departmentName} · ` : ""}
          {heading[role].text}
        </p>
      </div>
      <SummaryTiles
        summary={summary}
        role={role}
        onPick={(f) => setFilters({ sort: "priority", status: f.status ?? "open", overdue: f.overdue, priority: f.priority })}
      />
      <IssueList role={role} filters={filters} onFiltersChange={onFiltersChange} />
    </div>
  );
}
