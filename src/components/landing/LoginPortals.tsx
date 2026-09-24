"use client";

import { Building2, Check, HardHat, Info, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "./SectionHeading";

type Portal = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  points: string[];
  cta: string;
  accent: string;
};

const portals: Portal[] = [
  {
    id: "citizen",
    icon: Users,
    title: "Citizens",
    subtitle: "For residents",
    points: ["Report issues with photo & location", "Track complaints in real time", "Get notified at every update"],
    cta: "Citizen login",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "worker",
    icon: HardHat,
    title: "Field workers",
    subtitle: "For on-ground staff",
    points: ["See all assigned tasks in one list", "Update progress from the field", "Upload completion proof"],
    cta: "Worker login",
    accent: "from-amber-500 to-orange-500",
  },
  {
    id: "admin",
    icon: Building2,
    title: "Municipal administration",
    subtitle: "For departments & officers",
    points: ["Review and prioritize complaints", "Assign work to field teams", "City-wide dashboard & analytics"],
    cta: "Admin login",
    accent: "from-sky-500 to-indigo-500",
  },
];

export function LoginPortals() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section id="login" className="scroll-mt-16 border-y border-line bg-card/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Log in"
          title="One platform, a portal for everyone"
          text="Citizens, field workers and municipal staff each get a workspace built for their role."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {portals.map(({ id, icon: Icon, title, subtitle, points, cta, accent }) => (
            <div key={id} className="flex flex-col rounded-xl border border-line bg-card p-6">
              <span className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-fg">{title}</h3>
              <p className="text-sm text-subtle">{subtitle}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {p}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setNotice(id)}
                className={`mt-6 rounded-lg bg-gradient-to-r ${accent} px-4 py-2.5 font-semibold text-white shadow-sm transition-opacity hover:opacity-90`}
              >
                {cta}
              </button>
              {notice === id && (
                <p role="status" className="mt-3 flex items-start gap-2 text-xs text-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  Login is coming in the next step of CivicFix (authentication feature).
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
