"use client";

import { Building2, Eye, EyeOff, HardHat, Loader2, LogIn, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { authApi, portalPath, type Role } from "@/lib/staff-api";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-page px-3 py-2.5 text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50";

/** Only allow redirects back into our own staff portals. */
function safeNext(next: string | null, role: Role): string {
  if (next && next.startsWith(portalPath[role])) return next;
  return portalPath[role];
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in → go to the right portal.
  useEffect(() => {
    if (user) router.replace(safeNext(params.get("next"), user.role));
  }, [user, router, params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await authApi.login(email.trim(), password);
      setUser(u);
      router.replace(safeNext(params.get("next"), u.role));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError("Incorrect email or password.");
      else if (err instanceof ApiError && err.status === 429) setError("Too many sign-in attempts. Please wait a few minutes and try again.");
      else setError(err instanceof Error ? err.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mb-6 flex items-center justify-center gap-3">
        <Image src="/logo.png" alt="" width={40} height={40} className="size-10" />
        <span className="text-xl font-bold uppercase tracking-wide text-fg">
          Civic<span className="text-accent">Fix</span>
        </span>
      </Link>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-xl sm:p-8">
        <h1 className="text-xl font-bold text-fg">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted">For municipal officers, field workers and administrators.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-fg">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="username" required autoFocus />
          </label>
          <label className="block text-sm font-medium text-fg">
            Password
            <span className="relative block">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 mt-[3px] -translate-y-1/2 rounded p-1.5 text-muted hover:text-fg"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Sign in
          </button>
        </form>

        <ul className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center text-xs text-muted">
          <li className="flex flex-col items-center gap-1">
            <Building2 className="size-4 text-accent" /> Department officers
          </li>
          <li className="flex flex-col items-center gap-1">
            <HardHat className="size-4 text-orange-500" /> Field workers
          </li>
          <li className="flex flex-col items-center gap-1">
            <ShieldCheck className="size-4 text-violet-400" /> Administrators
          </li>
        </ul>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        Are you a citizen?{" "}
        <Link href="/track" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
          <Search className="size-3.5" /> Track your complaint
        </Link>{" "}
        or{" "}
        <Link href="/report" className="font-medium text-accent hover:underline">
          report an issue
        </Link>
        . No account needed.
      </p>
    </div>
  );
}
