"use client";

import { CheckCircle2, Loader2, Megaphone, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, ApiError, type ContactInput } from "@/lib/api";
import { SectionHeading } from "./SectionHeading";

const empty: ContactInput = { name: "", email: "", subject: "", message: "" };

export function Contact() {
  const [form, setForm] = useState<ContactInput>(empty);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = (key: keyof ContactInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((errs) => ({ ...errs, [key]: "" }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setFieldErrors({});
    try {
      const res = await api.sendContact(form);
      setStatus("sent");
      setMessage(res.message);
      setForm(empty);
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError) {
        setMessage(err.message);
        setFieldErrors(err.fields);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  }

  const inputClass = (field: string) =>
    `mt-1.5 w-full rounded-lg border bg-page px-3 py-2.5 text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
      fieldErrors[field] ? "border-rose-500" : "border-line"
    }`;

  return (
    <section id="contact" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          text="Questions, feedback or partnership ideas? Send us a message and our team will get back to you."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-line bg-card p-6">
              <Megaphone className="size-6 text-accent" />
              <h3 className="mt-3 font-semibold text-fg">Want to report a civic issue?</h3>
              <p className="mt-1 text-sm text-muted">
                Use <a href="#report" className="font-medium text-accent hover:underline">Report an issue</a> instead
                — it goes straight to the right department and you can track it.
              </p>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
              <Phone className="size-6 text-rose-500" />
              <h3 className="mt-3 font-semibold text-fg">Emergency?</h3>
              <p className="mt-1 text-sm text-muted">
                For emergencies such as fires, accidents or danger to life, call <strong className="text-fg">112</strong>{" "}
                immediately. Don&apos;t wait for an online report.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="rounded-xl border border-line bg-card p-6 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-fg">
                Name
                <input value={form.name} onChange={update("name")} className={inputClass("name")} placeholder="Your name" autoComplete="name" required />
                {fieldErrors.name && <span className="mt-1 block text-xs text-rose-500">{fieldErrors.name}</span>}
              </label>
              <label className="block text-sm font-medium text-fg">
                Email
                <input type="email" value={form.email} onChange={update("email")} className={inputClass("email")} placeholder="you@example.com" autoComplete="email" required />
                {fieldErrors.email && <span className="mt-1 block text-xs text-rose-500">{fieldErrors.email}</span>}
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-fg">
              Subject <span className="font-normal text-subtle">(optional)</span>
              <input value={form.subject} onChange={update("subject")} className={inputClass("subject")} placeholder="What is this about?" />
              {fieldErrors.subject && <span className="mt-1 block text-xs text-rose-500">{fieldErrors.subject}</span>}
            </label>
            <label className="mt-4 block text-sm font-medium text-fg">
              Message
              <textarea value={form.message} onChange={update("message")} rows={5} className={inputClass("message")} placeholder="Write your message…" required />
              {fieldErrors.message && <span className="mt-1 block text-xs text-rose-500">{fieldErrors.message}</span>}
            </label>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
              {status === "sent" && (
                <p role="status" className="flex items-center gap-1.5 text-sm text-blue-500">
                  <CheckCircle2 className="size-4" /> {message}
                </p>
              )}
              {status === "error" && (
                <p role="alert" className="text-sm text-rose-500">
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
