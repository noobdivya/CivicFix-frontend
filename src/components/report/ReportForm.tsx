"use client";

import { AlertTriangle, ArrowLeft, Loader2, Lock, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { api, ApiError, type Category, type CreatedIssue, type Place } from "@/lib/api";
import { CategoryIcon } from "@/lib/categories";
import { normalizeIndianMobile } from "@/lib/validation";
import { LocationPicker } from "./LocationPicker";
import type { Photo } from "./PhotoInput";
import { MAX_REPORT_PHOTOS, PhotosInput } from "./PhotosInput";
import { StepIndicator } from "./StepIndicator";
import { SubmitSuccess } from "./SubmitSuccess";

type FieldKey = "name" | "phone" | "description" | "photo" | "location" | "address" | "consent";
type Errors = Partial<Record<FieldKey | "category", string>>;

// Order used to scroll to the first invalid field.
const fieldOrder: FieldKey[] = ["name", "phone", "description", "photo", "location", "address", "consent"];

type Values = {
  name: string;
  phone: string;
  description: string;
  address: string;
  photos: Photo[];
  position: { lat: number; lng: number } | null;
  consent: boolean;
};

function validate(v: Values): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (name.length < 2 || name.length > 100) e.name = "Enter your full name.";
  if (!normalizeIndianMobile(v.phone)) e.phone = "Enter a valid 10-digit Indian mobile number.";
  const d = v.description.trim().length;
  if (d < 20) e.description = "Please describe the issue in at least 20 characters.";
  else if (d > 2000) e.description = "Keep the description under 2000 characters.";
  if (v.photos.length === 0) e.photo = "Add at least one photo of the issue.";
  else if (v.photos.length > MAX_REPORT_PHOTOS) e.photo = `You can upload at most ${MAX_REPORT_PHOTOS} photos.`;
  if (!v.position) e.location = "Pin the issue's location on the map.";
  if (v.address.trim().length < 3) e.address = "Enter the address or a nearby landmark.";
  if (!v.consent) e.consent = "Please confirm the declaration to submit.";
  return e;
}

const inputBase =
  "mt-1.5 w-full rounded-lg border bg-page px-3 py-2.5 text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50";

function Field({ name, label, hint, error, children }: { name: FieldKey; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div data-field={name}>
      <label className="block text-sm font-medium text-fg">
        {label}
        {children}
      </label>
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 font-semibold text-fg">
        <span className="grid size-6 place-items-center rounded-full bg-blue-500/15 text-xs text-accent">{step}</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Step 2: the full issue report form for one category. */
export function ReportForm({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    description: "",
    address: "",
    photos: [],
    position: null,
    consent: false,
  });
  const [area, setArea] = useState("");
  const addressTouched = useRef(false);

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false); // show errors live after the first submit attempt
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedIssue | null>(null);

  useEffect(() => {
    api
      .categories()
      .then((cs) => setCategory(cs.find((c) => c.slug === slug) ?? null))
      .catch((e: Error) => setLoadError(e.message));
  }, [slug]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (submitted) setErrors(validate(next));
      return next;
    });

  const onPosition = useCallback(
    (p: { lat: number; lng: number }) =>
      setValues((v) => {
        const next = { ...v, position: p };
        setErrors((e) => ({ ...e, location: undefined }));
        return next;
      }),
    [],
  );

  // Suggest "Area, City" as the address unless the user has typed their own.
  const onPlace = useCallback((place: Place | null) => {
    setArea(place?.area || place?.city || "");
    const suggestion = place ? [place.area, place.city].filter(Boolean).join(", ") : "";
    if (suggestion && !addressTouched.current) {
      setValues((v) => ({ ...v, address: suggestion }));
      setErrors((e) => ({ ...e, address: undefined }));
    }
  }, []);

  function scrollToFirstError(e: Errors) {
    const first = fieldOrder.find((k) => e[k]);
    if (first) document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setSubmitted(true);
    setSubmitError(null);
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      scrollToFirstError(e);
      return;
    }

    const fd = new FormData();
    fd.set("category", slug);
    fd.set("name", values.name.trim());
    fd.set("phone", normalizeIndianMobile(values.phone) ?? "");
    fd.set("description", values.description.trim());
    fd.set("address", values.address.trim());
    fd.set("area", area);
    fd.set("lat", String(values.position!.lat));
    fd.set("lng", String(values.position!.lng));
    fd.set("consent", "true");
    values.photos.forEach((p, i) => fd.append("photo", p.blob, `photo-${i + 1}.jpg`));

    setSending(true);
    try {
      const issue = await api.submitIssue(fd);
      setCreated(issue);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        setErrors(err.fields as Errors);
        scrollToFirstError(err.fields as Errors);
        setSubmitError(err.fields.category ?? "Please fix the highlighted fields.");
      } else {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setSending(false);
    }
  }

  if (loadError) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card p-10 text-center">
          <AlertTriangle className="size-8 text-st-reported" />
          <p className="text-fg">{loadError}</p>
        </div>
      </Shell>
    );
  }
  if (category === undefined) {
    return (
      <Shell>
        <div className="h-96 animate-pulse rounded-xl bg-card" aria-busy="true" />
      </Shell>
    );
  }
  if (category === null) {
    return (
      <Shell>
        <div className="rounded-xl border border-line bg-card p-10 text-center">
          <p className="text-lg font-semibold text-fg">Category not found</p>
          <p className="mt-1 text-muted">This category doesn&apos;t exist. Please choose one from the list.</p>
          <Link href="/report" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Choose a category
          </Link>
        </div>
      </Shell>
    );
  }

  if (created) {
    return (
      <Shell step={3}>
        <SubmitSuccess issue={created} />
      </Shell>
    );
  }

  const descLen = values.description.trim().length;

  return (
    <Shell step={2}>
      <div className="mb-6 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-accent">
          <CategoryIcon icon={category.icon} className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Report: {category.name}</h1>
          <p className="mt-1 text-sm text-muted">{category.description}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Section step={1} title="Your details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Full name" error={errors.name}>
              <input
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                className={`${inputBase} ${errors.name ? "border-rose-500" : "border-line"}`}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                maxLength={100}
              />
            </Field>
            <Field name="phone" label="Mobile number" hint="We'll use this to update you about your complaint." error={errors.phone}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-sm text-subtle">+91</span>
                <input
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={`${inputBase} pl-11 ${errors.phone ? "border-rose-500" : "border-line"}`}
                  placeholder="98765 43210"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  maxLength={16}
                />
              </div>
            </Field>
          </div>
        </Section>

        <Section step={2} title="About the issue">
          <Field name="description" label="Describe the issue" error={errors.description}>
            <textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              maxLength={2000}
              className={`${inputBase} ${errors.description ? "border-rose-500" : "border-line"}`}
              placeholder="What is the problem, how long has it been there, and how is it affecting people?"
            />
          </Field>
          <p className={`-mt-3 text-right text-xs ${descLen > 0 && descLen < 20 ? "text-amber-500" : "text-subtle"}`}>
            {descLen}/2000 {descLen < 20 && `· at least 20 characters`}
          </p>
          <div data-field="photo">
            <p className="mb-1.5 text-sm font-medium text-fg">
              Photos of the location <span className="font-normal text-subtle">(1–{MAX_REPORT_PHOTOS})</span>
            </p>
            <PhotosInput value={values.photos} onChange={(p) => set("photos", p)} error={errors.photo} />
          </div>
        </Section>

        <Section step={3} title="Location">
          <div data-field="location">
            <LocationPicker value={values.position} onChange={onPosition} onPlace={onPlace} error={errors.location} />
          </div>
          <Field name="address" label="Address / nearby landmark" hint="Filled in from the map — add details like a landmark or house number." error={errors.address}>
            <input
              value={values.address}
              onChange={(e) => {
                addressTouched.current = true;
                set("address", e.target.value);
              }}
              className={`${inputBase} ${errors.address ? "border-rose-500" : "border-line"}`}
              placeholder="e.g. Near Metro Gate 3, Karol Bagh"
              maxLength={300}
            />
          </Field>
        </Section>

        <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
          <div data-field="consent">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-fg">
              <input
                type="checkbox"
                checked={values.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-blue-600"
              />
              <span>
                I confirm the information above is true, and I consent to CivicFix and the municipal authority using my
                name and phone number to process this complaint.
              </span>
            </label>
            {errors.consent && <p className="mt-1 pl-7 text-xs text-rose-500">{errors.consent}</p>}
          </div>

          <div className="mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-subtle">
              <Lock className="size-3.5" /> Your details are only shared with the department handling this issue.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {sending ? "Submitting…" : "Submit report"}
            </button>
          </div>
          {submitError && (
            <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm text-rose-500">
              <AlertTriangle className="size-4" /> {submitError}
            </p>
          )}
        </section>
      </form>
    </Shell>
  );
}

function Shell({ step = 2, children }: { step?: 1 | 2 | 3; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {step !== 3 && (
        <Link href="/report" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Change category
        </Link>
      )}
      <div className="mb-6">
        <StepIndicator current={step} />
      </div>
      {children}
    </div>
  );
}
