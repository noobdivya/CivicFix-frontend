"use client";

import { Check, CheckCircle2, Copy, Home, MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { API_URL, type CreatedIssue } from "@/lib/api";

/** Step 3: confirmation with the tracking code. */
export function SubmitSuccess({ issue }: { issue: CreatedIssue }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      ?.writeText(issue.trackingCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const submitted = new Date(issue.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-line bg-card p-6 sm:p-8" role="status">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-st-resolved/15 text-st-resolved">
          <CheckCircle2 className="size-9" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-fg">Complaint submitted</h2>
        <p className="mt-1 text-muted">Thank you for helping improve your city. The responsible department will review it.</p>

        <div className="mt-6 w-full max-w-sm rounded-xl border border-dashed border-blue-500/50 bg-blue-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your tracking ID</p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-wider text-fg">{issue.trackingCode}</span>
            <button
              type="button"
              onClick={copy}
              className="rounded-md p-1.5 text-muted hover:bg-card-2 hover:text-fg"
              aria-label="Copy tracking ID"
            >
              {copied ? <Check className="size-4 text-st-resolved" /> : <Copy className="size-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">Save this ID — with your mobile number it lets you track every update.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-[10rem_1fr]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {issue.photoUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- photo served by the API
            <img key={url} src={`${API_URL}${url}`} alt={`Uploaded photo ${i + 1}`} className="h-32 w-full rounded-lg object-cover sm:w-40" />
          ))}
        </div>
        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted">Category</dt>
          <dd className="text-fg">{issue.category}</dd>
          <dt className="text-muted">Issue</dt>
          <dd className="text-fg">{issue.title}</dd>
          <dt className="text-muted">Location</dt>
          <dd className="flex gap-1 text-fg">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" /> {issue.address}
          </dd>
          <dt className="text-muted">Status</dt>
          <dd>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-2 py-0.5 text-xs text-fg">
              <span className="size-2 rounded-full bg-st-reported" /> Reported
            </span>
          </dd>
          <dt className="text-muted">Submitted</dt>
          <dd className="text-fg">{submitted}</dd>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/track?code=${issue.trackingCode}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          <Search className="size-4" /> Track this complaint
        </Link>
        <Link
          href="/report"
          className="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-2.5 font-semibold text-fg hover:bg-card-2"
        >
          <Plus className="size-4" /> Report another issue
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-2.5 font-semibold text-fg hover:bg-card-2"
        >
          <Home className="size-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}
