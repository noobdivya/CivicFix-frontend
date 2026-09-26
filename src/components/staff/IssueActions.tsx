"use client";

import { ArrowRightLeft, CheckCircle2, ClipboardCheck, HardHat, Loader2, MessageSquarePlus, RotateCcw, UserCheck, XCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PhotoInput, type Photo } from "@/components/report/PhotoInput";
import { ApiError } from "@/lib/api";
import { PRIORITIES, staffApi, type IssueDetail, type Priority, type Role } from "@/lib/staff-api";
import { useApi } from "@/lib/use-api";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50";

const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60",
  success:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/60 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-fg hover:bg-card-2 disabled:opacity-60",
};

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

const priorityLabel = (p: string) => p[0].toUpperCase() + p.slice(1);

/**
 * The actions available for this issue, based on the user's role and the
 * issue's status. Every action returns the updated issue.
 */
export function IssueActions({ issue, role, onChange }: { issue: IssueDetail; role: Role; onChange: (d: IssueDetail) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isManager = role === "admin" || role === "department";
  const open = ["reported", "assigned", "in_progress"].includes(issue.status);

  // Worker workloads change as tasks are assigned, so refetch after each change.
  const { data: workers } = useApi(isManager ? `workers-${issue.departmentId}-${issue.worker?.id}-${issue.status}` : "no-workers", () =>
    isManager ? staffApi.workers(role === "admin" ? issue.departmentId : undefined) : Promise.resolve([]),
  );
  const { data: departments } = useApi(isManager ? "departments" : "no-departments", () =>
    isManager ? staffApi.departments() : Promise.resolve([]),
  );

  const [priority, setPriority] = useState<Priority>(issue.reviewed ? issue.priority : "medium");
  const [workerId, setWorkerId] = useState<string>(issue.worker ? String(issue.worker.id) : "");
  const [reason, setReason] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [deptId, setDeptId] = useState("");
  const [note, setNote] = useState("");
  const [notePublic, setNotePublic] = useState(role === "worker");
  const [resolveNote, setResolveNote] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);

  async function run(name: string, fn: () => Promise<IssueDetail>, after?: () => void) {
    setBusy(name);
    setError(null);
    try {
      onChange(await fn());
      after?.();
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fields).length) setError(Object.values(e.fields).join(" "));
      else setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const spinner = (name: string, icon: ReactNode) => (busy === name ? <Loader2 className="size-4 animate-spin" /> : icon);

  const workerSelect = (
    <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className={inputClass} aria-label="Field worker">
      <option value="">Choose a field worker…</option>
      {workers?.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name} — {w.activeTasks} active {w.activeTasks === 1 ? "task" : "tasks"}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{error}</p>}

      {/* Department officer / admin: review a new issue */}
      {isManager && issue.status === "reported" && !issue.reviewed && (
        <Card title="Review complaint" icon={<ClipboardCheck className="size-4 text-accent" />}>
          <label className="block text-xs font-medium text-muted">
            Priority <span className="text-subtle">(sets the deadline: critical 24 h · high 3 d · medium 7 d · low 14 d)</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {priorityLabel(p)}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs font-medium text-muted">
            Assign now <span className="text-subtle">(optional)</span>
            {workerSelect}
          </label>
          {workers && workers.length === 0 && <p className="mt-1 text-xs text-amber-500">This department has no active field workers yet.</p>}
          <button
            disabled={!!busy}
            onClick={() => run("review", () => staffApi.review(issue.id, priority, workerId ? Number(workerId) : undefined))}
            className={`${btn.primary} mt-3 w-full`}
          >
            {spinner("review", <ClipboardCheck className="size-4" />)}
            {workerId ? "Save review & assign" : "Save review"}
          </button>
        </Card>
      )}

      {/* Assign / reassign */}
      {isManager && open && (issue.reviewed || issue.status !== "reported") && (
        <Card title={issue.worker ? "Reassign" : "Assign to a field worker"} icon={<UserCheck className="size-4 text-st-progress" />}>
          {workerSelect}
          <button
            disabled={!!busy || !workerId || String(issue.worker?.id ?? "") === workerId}
            onClick={() => run("assign", () => staffApi.assign(issue.id, Number(workerId)))}
            className={`${btn.primary} mt-3 w-full`}
          >
            {spinner("assign", <UserCheck className="size-4" />)}
            {issue.worker ? "Reassign" : "Assign"}
          </button>
          <label className="mt-4 block text-xs font-medium text-muted">
            Priority
            <select
              value={issue.priority}
              disabled={!!busy}
              onChange={(e) => run("priority", () => staffApi.priority(issue.id, e.target.value as Priority))}
              className={inputClass}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {priorityLabel(p)}
                </option>
              ))}
            </select>
          </label>
        </Card>
      )}

      {/* Field worker: start */}
      {issue.status === "assigned" && role === "worker" && (
        <Card title="Start work" icon={<HardHat className="size-4 text-st-progress" />}>
          <p className="mb-3 text-sm text-muted">Let the department and the citizen know work has begun on site.</p>
          <button disabled={!!busy} onClick={() => run("start", () => staffApi.start(issue.id))} className={`${btn.primary} w-full`}>
            {spinner("start", <HardHat className="size-4" />)} Start work
          </button>
        </Card>
      )}

      {/* Resolve with completion proof */}
      {(issue.status === "assigned" || issue.status === "in_progress") && role === "worker" && (
        <Card title="Mark as resolved" icon={<CheckCircle2 className="size-4 text-st-resolved" />}>
          <p className="mb-2 text-xs font-medium text-muted">Completion photo (required)</p>
          <PhotoInput value={photo} onChange={setPhoto} />
          <label className="mt-3 block text-xs font-medium text-muted">
            What was done? <span className="text-subtle">(shown to the citizen)</span>
            <textarea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} rows={2} maxLength={1000} className={inputClass} placeholder="e.g. Pothole filled and road surface levelled." />
          </label>
          <button
            disabled={!!busy || !photo}
            onClick={() => {
              const fd = new FormData();
              fd.set("note", resolveNote.trim());
              if (photo) fd.set("photo", photo.blob, "completion.jpg");
              run("resolve", () => staffApi.resolve(issue.id, fd), () => {
                setPhoto(null);
                setResolveNote("");
              });
            }}
            className={`${btn.success} mt-3 w-full`}
          >
            {spinner("resolve", <CheckCircle2 className="size-4" />)} Resolve issue
          </button>
        </Card>
      )}

      {/* Progress note */}
      <Card title="Add a note" icon={<MessageSquarePlus className="size-4 text-muted" />}>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} className={inputClass} placeholder="Progress update, site conditions, materials needed…" />
        <label className="mt-2 flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={notePublic} onChange={(e) => setNotePublic(e.target.checked)} className="accent-blue-600" />
          Visible to the citizen on their tracking page
        </label>
        <button
          disabled={!!busy || note.trim().length < 2}
          onClick={() => run("note", () => staffApi.note(issue.id, note.trim(), notePublic), () => setNote(""))}
          className={`${btn.ghost} mt-3 w-full`}
        >
          {spinner("note", <MessageSquarePlus className="size-4" />)} Add note
        </button>
      </Card>

      {/* Transfer */}
      {isManager && open && (
        <Card title="Wrong department?" icon={<ArrowRightLeft className="size-4 text-accent" />}>
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className={inputClass} aria-label="Department">
            <option value="">Transfer to…</option>
            {departments
              ?.filter((d) => d.id !== issue.departmentId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
          <button
            disabled={!!busy || !deptId}
            onClick={() => run("transfer", () => staffApi.transfer(issue.id, Number(deptId)), () => setDeptId(""))}
            className={`${btn.ghost} mt-3 w-full`}
          >
            {spinner("transfer", <ArrowRightLeft className="size-4" />)} Transfer
          </button>
        </Card>
      )}

      {/* Reject */}
      {isManager && open && (
        <Card title="Close without action" icon={<XCircle className="size-4 text-rose-500" />}>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={500} className={inputClass} placeholder="Reason shown to the citizen, e.g. duplicate of CF-…, not a civic issue" />
          <button
            disabled={!!busy || reason.trim().length < 5}
            onClick={() => {
              if (confirm("Close this complaint without action? The citizen will see your reason.")) {
                run("reject", () => staffApi.reject(issue.id, reason.trim()), () => setReason(""));
              }
            }}
            className={`${btn.danger} mt-3 w-full`}
          >
            {spinner("reject", <XCircle className="size-4" />)} Reject complaint
          </button>
        </Card>
      )}

      {/* Reopen */}
      {isManager && (issue.status === "resolved" || issue.status === "rejected") && (
        <Card title="Reopen" icon={<RotateCcw className="size-4 text-st-reported" />}>
          <textarea value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} rows={2} maxLength={500} className={inputClass} placeholder="Why does this need more work?" />
          <button
            disabled={!!busy || reopenReason.trim().length < 5}
            onClick={() => run("reopen", () => staffApi.reopen(issue.id, reopenReason.trim()), () => setReopenReason(""))}
            className={`${btn.ghost} mt-3 w-full`}
          >
            {spinner("reopen", <RotateCcw className="size-4" />)} Reopen complaint
          </button>
        </Card>
      )}
    </div>
  );
}
