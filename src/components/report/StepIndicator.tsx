import { Check } from "lucide-react";

const steps = ["Choose category", "Issue details", "Submitted"];

/** "1 Choose category — 2 Issue details — 3 Submitted" progress bar. */
export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-xs sm:text-sm" aria-label="Progress">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current || current === 3;
        const active = n === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                done ? "bg-st-resolved text-white" : active ? "bg-blue-600 text-white" : "bg-card-2 text-muted"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="size-4" /> : n}
            </span>
            <span className={`truncate ${active ? "" : "hidden sm:inline"} ${active || done ? "font-medium text-fg" : "text-muted"}`}>
              {label}
            </span>
            {n < steps.length && <span className="h-px flex-1 bg-line" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
