import { BarChart3, BellRing, Clock, Eye, Map, Repeat, Users, XCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const problems = [
  "Citizens don't know what happens after they complain",
  "Departments struggle to prioritize and assign issues",
  "Field workers have no central list of tasks",
  "Nobody knows how long fixes actually take",
  "Administrators lack a real-time view across areas",
];

const features = [
  { icon: Users, title: "One shared system", text: "Citizens, departments, supervisors and field workers work on the same issue record." },
  { icon: Map, title: "Live map", text: "Every open issue across wards and neighbourhoods, plotted in real time." },
  { icon: BellRing, title: "Notifications", text: "Everyone is updated automatically whenever an issue changes status." },
  { icon: Clock, title: "Resolution tracking", text: "Every step is timestamped, so you know exactly how long each fix takes." },
  { icon: Repeat, title: "Recurring hotspots", text: "Spot locations where the same problems keep coming back." },
  { icon: BarChart3, title: "Admin dashboard", text: "A centralized overview of civic issues across different areas." },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-16 border-y border-line bg-card/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="About CivicFix"
          title="Closing the gap between citizens and their city"
          text="Civic complaints today are scattered across phone calls, apps and offices. CivicFix brings the entire lifecycle of an issue into one transparent platform."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-card p-6">
            <h3 className="flex items-center gap-2 font-semibold text-fg">
              <Eye className="size-5 text-accent" /> The problem
            </h3>
            <ul className="mt-4 space-y-3">
              {problems.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-muted">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-rose-500" /> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-line bg-card p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-accent">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-fg">{title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
