import { ArrowRight, Camera, CircleAlert, Construction, Droplets, Lightbulb, MapPin, Send, Tags, TrafficCone, Trash2 } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { icon: Camera, title: "Take a photo", text: "Capture the problem clearly so the team knows what to fix." },
  { icon: MapPin, title: "Pin the location", text: "Use your current location or drop a pin on the map." },
  { icon: Tags, title: "Choose a category", text: "Your report goes straight to the responsible department." },
  { icon: Send, title: "Submit & track", text: "Get a complaint ID and updates until it's resolved." },
];

const categories = [
  { icon: CircleAlert, name: "Potholes" },
  { icon: Lightbulb, name: "Streetlights" },
  { icon: Trash2, name: "Garbage" },
  { icon: Droplets, name: "Water leakage" },
  { icon: Construction, name: "Damaged roads" },
  { icon: TrafficCone, name: "Traffic signals" },
];

export function ReportIssue() {
  return (
    <section id="report" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Report an issue"
          title="Seen something broken? Report it in under a minute"
          text="Four simple steps, and your complaint reaches the right department — with full visibility until it's fixed."
        />

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-xl border border-line bg-card p-6">
              <span className="absolute right-5 top-4 text-4xl font-black text-card-2">{i + 1}</span>
              <span className="grid size-11 place-items-center rounded-xl bg-blue-500/15 text-accent">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-fg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-6 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-10 text-center text-white">
          <ul className="flex flex-wrap justify-center gap-2">
            {categories.map(({ icon: Icon, name }) => (
              <li key={name} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm">
                <Icon className="size-4" /> {name}
              </li>
            ))}
          </ul>
          <a
            href="#login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
          >
            Report an issue <ArrowRight className="size-4" />
          </a>
          <p className="text-sm text-blue-50">Log in as a citizen to submit and track your reports.</p>
        </div>
      </div>
    </section>
  );
}
