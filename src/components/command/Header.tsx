"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api, type Health } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { portalPath } from "@/lib/staff-api";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/track", label: "Track complaint" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
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

/** Checks the server once when the page loads (refresh the page to re-check). */
function useSystemState(): SystemState {
  const [state, setState] = useState<SystemState>("checking");
  useEffect(() => {
    api
      .health()
      .then((h: Health) => setState(h.database === "up" ? "normal" : "degraded"))
      .catch(() => setState("offline"));
  }, []);
  return state;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const now = useClock();
  const system = systemLabel[useSystemState()];
  const { user } = useAuth();
  const account = user ? { href: portalPath[user.role], label: "My portal" } : { href: "/login", label: "Staff login" };
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" onClick={close} className="flex min-w-0 items-center gap-3" aria-label="CivicFix home">
          <Image src="/logo.png" alt="" width={36} height={36} className="size-9 shrink-0" priority />
          <span className="min-w-0 leading-tight">
            <span className="block text-base font-bold uppercase tracking-wide text-fg sm:text-lg">
              Civic<span className="text-accent">Fix</span>
            </span>
            <span className="hidden truncate text-xs text-muted sm:block">Civic Issue Management Portal</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </Link>
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
          <Link
            href={account.href}
            className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-card-2 sm:inline-block"
          >
            {account.label}
          </Link>
          <Link
            href="/report"
            className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:inline-block"
          >
            Report an issue
          </Link>
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
            {[...links, account].map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block rounded-lg px-3 py-2 text-fg hover:bg-card-2">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/report"
            onClick={close}
            className="mt-2 block rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white"
          >
            Report an issue
          </Link>
          <p className="mt-3 flex items-center gap-1.5 px-3 text-xs text-muted">
            <span className={`size-2 rounded-full ${system.dot}`} /> {system.text}
          </p>
        </div>
      )}
    </header>
  );
}
