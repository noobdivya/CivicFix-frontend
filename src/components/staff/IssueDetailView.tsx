"use client";

import { AlarmClock, ArrowLeft, Building2, Calendar, MapPin, Phone, Tag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MiniMap } from "@/components/ui/MiniMap";
import { PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { Timeline } from "@/components/ui/Timeline";
import { API_URL } from "@/lib/api";
import { dueLabel, formatDateTime } from "@/lib/format";
import { portalPath, staffApi, type Role } from "@/lib/staff-api";
import { formatHours } from "@/lib/status";
import { useApi } from "@/lib/use-api";
import { IssueActions } from "./IssueActions";

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-2 text-sm">
      <span className="mt-0.5 text-subtle">{icon}</span>
      <span className="w-24 shrink-0 text-muted">{label}</span>
      <span className="min-w-0 flex-1 break-words text-fg">{children}</span>
    </div>
  );
}

/** Full issue page for staff: details, photos, map, timeline and actions. */
export function IssueDetailView({ id, role }: { id: number; role: Role }) {
  const { data: issue, error, setData } = useApi(`issue-${id}`, () => staffApi.issue(id));
  const back = role === "admin" ? "/admin/issues" : portalPath[role];

  if (error) {
    return (
      <div className="rounded-xl border border-line bg-card p-10 text-center">
        <p className="font-semibold text-fg">{error === "issue not found" ? "Issue not found" : error}</p>
        <p className="mt-1 text-sm text-muted">It may have been reassigned or moved to another department.</p>
        <Link href={back} className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }
  if (!issue) return <div className="h-96 animate-pulse rounded-xl bg-card" aria-busy="true" />;

  const open = ["reported", "assigned", "in_progress"].includes(issue.status);
  const reportPhotos = issue.photos.filter((p) => p.kind === "report");
  const proofPhotos = issue.photos.filter((p) => p.kind === "completion");
  const resolutionHours =
    issue.resolvedAt && (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / 3_600_000;

  return (
    <div>
      <Link href={back} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> {role === "worker" ? "My tasks" : "Back to issues"}
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted">{issue.trackingCode ?? `#${issue.id}`}</span>
            <StatusBadge status={issue.status} reviewed={issue.reviewed} />
            {(issue.reviewed || issue.status !== "reported") && <PriorityBadge priority={issue.priority} />}
            {issue.overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <AlarmClock className="size-3" /> Overdue
              </span>
            )}
          </div>
          <h1 className="mt-2 text-xl font-bold text-fg sm:text-2xl">{issue.title}</h1>
        </div>
        {issue.dueAt && open && (
          <p className={`rounded-lg border px-3 py-2 text-sm ${issue.overdue ? "border-rose-500/50 text-rose-500" : "border-line text-muted"}`}>
            Deadline {formatDateTime(issue.dueAt)} · {dueLabel(issue.dueAt)}
          </p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Description</h2>
            <p className="whitespace-pre-wrap text-fg">{issue.description}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {reportPhotos.map((p) => (
                <figure key={p.url}>
                  <a href={`${API_URL}${p.url}`} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- photo served by the API */}
                    <img src={`${API_URL}${p.url}`} alt="Photo reported by the citizen" className="h-56 w-full rounded-lg object-cover" />
                  </a>
                  <figcaption className="mt-1 text-xs text-subtle">Reported photo</figcaption>
                </figure>
              ))}
              {proofPhotos.map((p) => (
                <figure key={p.url}>
                  <a href={`${API_URL}${p.url}`} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- photo served by the API */}
                    <img src={`${API_URL}${p.url}`} alt="Completion proof" className="h-56 w-full rounded-lg border-2 border-st-resolved/60 object-cover" />
                  </a>
                  <figcaption className="mt-1 text-xs text-st-resolved">Completion proof · {formatDateTime(p.createdAt)}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <MapPin className="size-3.5" /> Location
            </h2>
            <p className="mb-3 text-fg">{issue.address}</p>
            {issue.lat !== null && issue.lng !== null && <MiniMap lat={issue.lat} lng={issue.lng} className="h-64" />}
          </section>

          <section className="rounded-xl border border-line bg-card p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Timeline</h2>
            <Timeline events={issue.events} showActors />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-card px-4 py-2">
            <Row icon={<Tag className="size-4" />} label="Category">{issue.category}</Row>
            <Row icon={<Building2 className="size-4" />} label="Department">{issue.departmentName ?? "—"}</Row>
            <Row icon={<UserRound className="size-4" />} label="Field worker">{issue.worker?.name ?? "Not assigned"}</Row>
            <Row icon={<Calendar className="size-4" />} label="Reported">{formatDateTime(issue.createdAt)}</Row>
            {issue.resolvedAt && (
              <Row icon={<Calendar className="size-4" />} label="Resolved">
                {formatDateTime(issue.resolvedAt)} ({formatHours(resolutionHours || 0)})
              </Row>
            )}
            {issue.rejectionReason && (
              <Row icon={<Tag className="size-4" />} label="Closed because">{issue.rejectionReason}</Row>
            )}
          </section>

          {issue.reporter && (
            <section className="rounded-xl border border-line bg-card px-4 py-2">
              <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Reported by</p>
              <Row icon={<UserRound className="size-4" />} label="Name">{issue.reporter.name ?? "—"}</Row>
              {issue.reporter.phone && (
                <Row icon={<Phone className="size-4" />} label="Mobile">
                  <a href={`tel:+91${issue.reporter.phone}`} className="text-accent hover:underline">
                    +91 {issue.reporter.phone}
                  </a>
                </Row>
              )}
            </section>
          )}

          <IssueActions issue={issue} role={role} onChange={setData} />
        </aside>
      </div>
    </div>
  );
}
