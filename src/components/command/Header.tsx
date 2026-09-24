"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api, type Health } from "@/lib/api";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

type SystemState = "checking" | "normal" | "degraded" | "offline";

const systemLabel: Record<SystemState, { text: string; dot: string }> = {
  checking: { text: "Checking…", dot: "bg-subtle" },
  normal: { text: "System normal", dot: "bg-st-resolved" },
  degraded: { text: "Database offline", dot: "bg-st-reported" },
  offline: { text: "Server offline", dot: "bg-rose-500" },
};

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}

function useSystemState(): SystemState {
  const [state, setState] = useState<SystemState>("checking");
  useEffect(() => {
    const check = () =>
      api
        .health()
        .then((h: Health) => setState(h.database === "up" ? "normal" : "degraded"))
        .catch(() => setState("offline"));
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);
  return state;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const now = useClock();
  const system = systemLabel[useSystemState()];
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#home" onClick={close} className="flex min-w-0 items-center gap-3" aria-label="CivicFix home">
          <Image src="/logo.png" alt="" width={36} height={36} className="size-9 shrink-0" priority />
          <span className="min-w-0 leading-tight">
            <span className="block text-base font-bold uppercase tracking-wide text-fg sm:text-lg">
              Civic<span className="text-accent">Fix</span>
            </span>
            <span className="hidden truncate text-xs text-muted sm:block">Civic Issue Management Portal</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs leading-tight text-muted xl:block" aria-live="off">
            <div className="text-fg">
              {now ? now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : " "}
            </div>
            <div className="tabular-nums">{now ? now.toLocaleTimeString("en-IN", { hour12: false }) : " "}</div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted lg:flex">
            <span className={`size-2 rounded-full ${system.dot}`} /> {system.text}
          </span>
          <ThemeToggle />
          <a
            href="#login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-card-2 sm:inline-block"
          >
            Log in
          </a>
          <a
            href="#report"
            className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:inline-block"
          >
            Report an issue
          </a>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-line text-fg md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-card px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {[...links, { href: "#login", label: "Log in" }].map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={close} className="block rounded-lg px-3 py-2 text-fg hover:bg-card-2">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#report"
            onClick={close}
            className="mt-2 block rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white"
          >
            Report an issue
          </a>
          <p className="mt-3 flex items-center gap-1.5 px-3 text-xs text-muted">
            <span className={`size-2 rounded-full ${system.dot}`} /> {system.text}
          </p>
        </div>
      )}
    </header>
  );
}
