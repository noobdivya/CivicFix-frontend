"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, type Category } from "@/lib/api";
import { CategoryIcon } from "@/lib/categories";

/** Step 1: grid of categories; each card opens the report form for it. */
export function CategoryPicker() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .categories()
      .then((c) => {
        setCategories(c);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  if (error && !categories) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card p-10 text-center">
        <AlertTriangle className="size-8 text-st-reported" />
        <p className="text-fg">{error}</p>
        <button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Try again
        </button>
      </div>
    );
  }

  if (!categories) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        return (
          <li key={c.slug}>
            <Link
              href={`/report/${c.slug}`}
              className="group flex h-full gap-4 rounded-xl border border-line bg-card p-5 transition hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-accent transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <CategoryIcon icon={c.icon} className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-fg">{c.name}</span>
                  <ArrowRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{c.description}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
