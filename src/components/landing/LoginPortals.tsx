import { Building2, Check, HardHat, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createElement } from "react";
import { SectionHeading } from "./SectionHeading";

type Portal = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  points: string[];
  actions: { href: string; label: string }[];
  accent: string;
};

const portals: Portal[] = [
  {
    id: "citizen",
    icon: Users,
    title: "Citizens",
    subtitle: "No account needed",
    points: ["Report issues with photo & location", "Track complaints with your tracking ID", "See every update until it's fixed"],
    actions: [
      { href: "/report", label: "Report an issue" },
      { href: "/track", label: "Track complaint" },
    ],
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "worker",
    icon: HardHat,
    title: "Field workers",
    subtitle: "For on-ground staff",
    points: ["See all assigned tasks in one list", "Update progress from the field", "Upload completion proof"],
    actions: [{ href: "/login?next=/worker", label: "Worker login" }],
    accent: "from-amber-500 to-orange-500",
  },
  {
    id: "admin",
    icon: Building2,
    title: "Municipal administration",
    subtitle: "For departments & officers",
    points: ["Review and prioritize complaints", "Assign work to field teams", "City-wide dashboard & analytics"],
    actions: [{ href: "/login", label: "Officer / admin login" }],
    accent: "from-sky-500 to-indigo-500",
  },
];

export function LoginPortals() {
  return (
    <section id="login" className="scroll-mt-16 border-y border-line bg-card/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Portals"
          title="One platform, a portal for everyone"
          text="Citizens, field workers and municipal staff each get a workspace built for their role."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {portals.map(({ id, icon, title, subtitle, points, actions, accent }) => (
            <div key={id} className="flex flex-col rounded-xl border border-line bg-card p-6">
              <span className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
                {createElement(icon, { className: "size-6" })}
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
              <div className="mt-6 flex flex-col gap-2">
                {actions.map((a, i) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={
                      i === 0
                        ? `rounded-lg bg-gradient-to-r ${accent} px-4 py-2.5 text-center font-semibold text-white shadow-sm transition-opacity hover:opacity-90`
                        : "rounded-lg border border-line px-4 py-2.5 text-center font-semibold text-fg hover:bg-card-2"
                    }
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
