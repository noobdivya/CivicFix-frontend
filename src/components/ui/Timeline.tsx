import {
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  Flag,
  HardHat,
  Lock,
  MessageSquare,
  RotateCcw,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import type { IssueEvent } from "@/lib/staff-api";
import { formatDateTime } from "@/lib/format";

const eventIcon: Record<string, { icon: LucideIcon; className: string }> = {
  reported: { icon: FilePlus2, className: "text-st-reported" },
  reviewed: { icon: ClipboardCheck, className: "text-accent" },
  assigned: { icon: UserCheck, className: "text-st-progress" },
  assigned_detail: { icon: UserCheck, className: "text-st-progress" },
  started: { icon: HardHat, className: "text-st-progress" },
  note: { icon: MessageSquare, className: "text-muted" },
  resolved: { icon: CheckCircle2, className: "text-st-resolved" },
  rejected: { icon: XCircle, className: "text-rose-500" },
  reopened: { icon: RotateCcw, className: "text-st-reported" },
  priority: { icon: Flag, className: "text-orange-500" },
  transferred: { icon: ArrowRightLeft, className: "text-accent" },
};

const roleLabel: Record<string, string> = {
  citizen: "Citizen",
  department: "Department",
  worker: "Field worker",
  admin: "Admin",
};

/** Vertical list of issue events, oldest first. */
export function Timeline({ events, showActors = false }: { events: IssueEvent[]; showActors?: boolean }) {
  if (events.length === 0) return <p className="text-sm text-subtle">No updates yet.</p>;
  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {events.map((e) => {
        const style = eventIcon[e.type] ?? eventIcon.note;
        const who = showActors && e.actorName ? `${e.actorName} · ${roleLabel[e.actorRole] ?? e.actorRole}` : roleLabel[e.actorRole];
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[35px] grid size-6 place-items-center rounded-full border border-line bg-card">
              {createElement(style.icon, { className: `size-3.5 ${style.className}` })}
            </span>
            <p className="text-sm text-fg">{e.message}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-subtle">
              <span>{formatDateTime(e.createdAt)}</span>
              {who && <span>· {who}</span>}
              {showActors && !e.isPublic && (
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <Lock className="size-3" /> Internal
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
