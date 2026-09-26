"use client";

import { ChevronDown, Loader2, LogOut, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";
import { portalPath, type Role } from "@/lib/staff-api";
import { NotificationBell } from "./NotificationBell";

const portalName: Record<Role, string> = {
  admin: "Admin Console",
  department: "Department Portal",
  worker: "Field Worker",
};

const nav: Record<Role, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/issues", label: "All issues" },
    { href: "/admin/users", label: "Staff" },
  ],
  department: [{ href: "/department", label: "Issue queue" }],
  worker: [{ href: "/worker", label: "My tasks" }],
};

/** Layout + access guard for the staff portals. */
export function StaffShell({ role, children }: { role: Role; children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [user, router, pathname]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  if (user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-sm rounded-xl border border-line bg-card p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-st-reported" />
          <h1 className="mt-3 text-lg font-semibold text-fg">This area isn&apos;t for your account</h1>
          <p className="mt-1 text-sm text-muted">You&apos;re signed in as {user.name}.</p>
          <Link
            href={portalPath[user.role]}
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to my portal
          </Link>
        </div>
      </div>
    );
  }

  const signOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[1100] border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <Link href={portalPath[role]} className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="" width={34} height={34} className="size-8.5 shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block font-bold uppercase tracking-wide text-fg">
                Civic<span className="text-accent">Fix</span>
              </span>
              <span className="block truncate text-xs text-muted">{portalName[role]}</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Portal">
            {nav[role].map((l) => {
              const active = l.href === portalPath[role] ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-card-2 text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell role={role} />
            <ThemeToggle />
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-2 hover:bg-card-2"
                aria-expanded={menu}
              >
                <span className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden text-sm text-fg sm:inline">{user.name.split(" ")[0]}</span>
                <ChevronDown className="size-4 text-muted" />
              </button>
              {menu && (
                <div className="absolute right-0 top-11 z-[1200] w-64 rounded-xl border border-line bg-card p-2 shadow-2xl">
                  <div className="border-b border-line px-3 pb-3 pt-1">
                    <p className="font-medium text-fg">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    {user.departmentName && <p className="mt-1 text-xs text-accent">{user.departmentName}</p>}
                  </div>
                  <div className="pt-1 md:hidden">
                    {nav[role].map((l) => (
                      <Link key={l.href} href={l.href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 text-sm text-fg hover:bg-card-2">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-fg hover:bg-card-2">
                    Public website
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-500 hover:bg-card-2"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
