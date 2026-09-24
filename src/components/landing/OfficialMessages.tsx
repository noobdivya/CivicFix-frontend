"use client";

import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type OfficialMessage } from "@/lib/api";
import { SectionHeading } from "./SectionHeading";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OfficialMessages() {
  const [messages, setMessages] = useState<OfficialMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .officialMessages()
      .then(setMessages)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section id="messages" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="From our representatives"
          title="Messages from your officials"
          text="Your municipal corporation and elected representatives are committed to faster, transparent fixes."
        />

        {error && <p className="mt-10 text-center text-sm text-muted">Messages could not be loaded: {error}</p>}

        {!messages && !error && (
          <div className="mt-12 grid gap-6 md:grid-cols-2" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-card-2" />
            ))}
          </div>
        )}

        {messages && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {messages.map((m) => (
              <figure key={m.id} className="relative flex flex-col rounded-xl border border-line bg-card p-8">
                <Quote className="size-8 text-blue-500/40" />
                <blockquote className="mt-4 flex-1 leading-relaxed text-fg">&ldquo;{m.message}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-6">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{m.name}</p>
                    <p className="text-sm text-accent">{m.designation}</p>
                    <p className="text-sm text-muted">{m.office}</p>
                  </div>
                </figcaption>
                {m.isSample && (
                  <span className="absolute right-4 top-4 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-subtle">
                    Sample message
                  </span>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
