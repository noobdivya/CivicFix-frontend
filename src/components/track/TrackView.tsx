"use client";

import { AlertTriangle, Building2, Calendar, Check, Loader2, MapPin, Search, Timer, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MiniMap } from "@/components/ui/MiniMap";
import { PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { Timeline } from "@/components/ui/Timeline";
import { API_URL, ApiError } from "@/lib/api";
import { CategoryIcon } from "@/lib/categories";
import { formatDateTime } from "@/lib/format";
import { trackApi, type TrackedIssue } from "@/lib/staff-api";
import { formatHours } from "@/lib/status";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-page px-3 py-2.5 text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50";

const stages = [
  { key: "reported", label: "Reported" },
  { key: "reviewed", label: "Reviewed" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "Work started" },
  { key: "resolved", label: "Resolved" },
];

function stageIndex(t: TrackedIssue): number {
  if (t.status === "resolved") return 4;
  if (t.status === "in_progress") return 3;
  if (t.status === "assigned") return 2;
  if (t.reviewedAt) return 1;
  return 0;
}

/** Citizen-facing complaint tracker (tracking ID + mobile number). */
export function TrackView() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState<TrackedIssue | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setIssue(await trackApi.track(code, phone));
    } catch (err) {
      setIssue(null);
      if (err instanceof ApiError && err.status === 404) setError("No complaint found with this tracking ID and mobile number. Please check both and try again.");
      else if (err instanceof ApiError && err.status === 422) setError("Enter your tracking ID (e.g. CF-7KQ2M9XA) and the 10-digit mobile number you reported with.");
      else setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">Track your complaint</h1>
      <p className="mt-2 text-muted">Enter the tracking ID you received when you reported, and your mobile number.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-xl border border-line bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm font-medium text-fg">
          Tracking ID
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={`${inputClass} font-mono tracking-wider`} placeholder="CF-XXXXXXXX" maxLength={14} required />
        </label>
        <label className="block text-sm font-medium text-fg">
          Mobile number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="98765 43210" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={16} required />
        </label>
        <button type="submit" disabled={busy} className="flex h-[46px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Track
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-fg">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" /> {error}
        </p>
      )}

      {issue && <TrackResult issue={issue} />}
    </div>
  );
}

function TrackResult({ issue }: { issue: TrackedIssue }) {
  const stage = stageIndex(issue);
  const rejected = issue.status === "rejected";
  const reportPhoto = issue.photos.find((p) => p.kind === "report");
  const proof = issue.photos.filter((p) => p.kind === "completion");

  return (
    <div className="mt-8 space-y-5">
      <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-accent">
            <CategoryIcon icon={issue.categoryIcon} className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted">{issue.trackingCode}</span>
              <StatusBadge status={issue.status} reviewed={!!issue.reviewedAt} />
              {issue.priority && <PriorityBadge priority={issue.priority} />}
            </div>
            <h2 className="mt-1 text-xl font-semibold text-fg">{issue.title}</h2>
            <p className="text-sm text-muted">
              {issue.category} · reported by {issue.reporterName}
            </p>
          </div>
        </div>

        {rejected ? (
          <div className="mt-6 flex gap-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-4">
            <XCircle className="size-5 shrink-0 text-rose-500" />
            <div>
              <p className="font-medium text-fg">This complaint was closed without action</p>
              {issue.rejectionReason && <p className="mt-1 text-sm text-muted">Reason: {issue.rejectionReason}</p>}
            </div>
          </div>
        ) : (
          <ol className="mt-6 grid grid-cols-5 gap-1" aria-label="Progress">
            {stages.map((s, i) => {
              const done = i <= stage;
              return (
                <li key={s.key} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex w-full items-center">
                    <span className={`h-1 flex-1 rounded ${i === 0 ? "invisible" : done ? "bg-st-resolved" : "bg-card-2"}`} />
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${done ? "bg-st-resolved text-white" : "bg-card-2 text-subtle"}`}>
                      {done ? <Check className="size-4" /> : <span className="text-xs">{i + 1}</span>}
                    </span>
                    <span className={`h-1 flex-1 rounded ${i === stages.length - 1 ? "invisible" : i < stage ? "bg-st-resolved" : "bg-card-2"}`} />
                  </span>
                  <span className={`text-xs ${done ? "font-medium text-fg" : "text-subtle"}`}>{s.label}</span>
                </li>
              );
            })}
          </ol>
        )}

        <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <Building2 className="mt-0.5 size-4 text-subtle" />
            <dt className="text-muted">Department:</dt>
            <dd className="text-fg">{issue.department ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <Calendar className="mt-0.5 size-4 text-subtle" />
            <dt className="text-muted">Reported:</dt>
            <dd className="text-fg">{formatDateTime(issue.createdAt)}</dd>
          </div>
          {issue.dueAt && !["resolved", "rejected"].includes(issue.status) && (
            <div className="flex gap-2">
              <Timer className="mt-0.5 size-4 text-subtle" />
              <dt className="text-muted">Target date:</dt>
              <dd className="text-fg">{formatDateTime(issue.dueAt)}</dd>
            </div>
          )}
          {issue.resolutionHours !== null && (
            <div className="flex gap-2">
              <Timer className="mt-0.5 size-4 text-st-resolved" />
              <dt className="text-muted">Fixed in:</dt>
              <dd className="font-medium text-fg">{formatHours(issue.resolutionHours)}</dd>
            </div>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <MapPin className="mt-0.5 size-4 text-subtle" />
            <dt className="text-muted">Location:</dt>
            <dd className="text-fg">{issue.address}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Updates</h3>
          <Timeline events={issue.timeline} />
        </section>
        <section className="space-y-4 rounded-xl border border-line bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Photos & location</h3>
          <div className="grid grid-cols-2 gap-3">
            {reportPhoto && (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element -- photo served by the API */}
                <img src={`${API_URL}${reportPhoto.url}`} alt="Your reported photo" className="h-32 w-full rounded-lg object-cover" />
                <figcaption className="mt-1 text-xs text-subtle">Before</figcaption>
              </figure>
            )}
            {proof.map((p) => (
              <figure key={p.url}>
                {/* eslint-disable-next-line @next/next/no-img-element -- photo served by the API */}
                <img src={`${API_URL}${p.url}`} alt="Completion photo" className="h-32 w-full rounded-lg border-2 border-st-resolved/60 object-cover" />
                <figcaption className="mt-1 text-xs text-st-resolved">After (completion proof)</figcaption>
              </figure>
            ))}
          </div>
          {issue.lat !== null && issue.lng !== null && <MiniMap lat={issue.lat} lng={issue.lng} className="h-44" />}
        </section>
      </div>
    </div>
  );
}
