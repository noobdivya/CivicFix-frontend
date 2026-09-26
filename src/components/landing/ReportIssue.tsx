import { ArrowRight, Camera, MapPin, Send, Tags } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/lib/categories";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { icon: Tags, title: "Choose a category", text: "Pick the type of problem — it goes straight to the responsible department." },
  { icon: Camera, title: "Describe & add a photo", text: "Tell us what's wrong and snap a clear photo of the spot." },
  { icon: MapPin, title: "Pin the location", text: "Use your current location or tap the exact spot on the map." },
  { icon: Send, title: "Submit & get a tracking ID", text: "You get a tracking ID instantly to follow up on your complaint." },
];

// Shortcuts straight to the form for the most common categories.
const quickCategories = [
  { slug: "pothole", name: "Potholes", icon: "pothole" },
  { slug: "road-damage", name: "Road problems", icon: "road" },
  { slug: "electricity", name: "Electricity", icon: "electricity" },
  { slug: "streetlight", name: "Streetlights", icon: "streetlight" },
  { slug: "drainage", name: "Drainage", icon: "drainage" },
  { slug: "waterlogging", name: "Waterlogging", icon: "waterlogging" },
  { slug: "garbage", name: "Garbage", icon: "garbage" },
  { slug: "other", name: "Other", icon: "other" },
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
            {quickCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/report/${c.slug}`}
                    className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm transition-colors hover:bg-white/25"
                  >
                    <CategoryIcon icon={c.icon} className="size-4" /> {c.name}
                  </Link>
                </li>
            ))}
          </ul>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
          >
            Report an issue <ArrowRight className="size-4" />
          </Link>
          <p className="text-sm text-blue-50">No account needed — just your name and mobile number.</p>
        </div>
      </div>
    </section>
  );
}
