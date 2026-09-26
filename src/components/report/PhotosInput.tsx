"use client";

import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { compressImage, formatBytes } from "@/lib/image";
import type { Photo } from "./PhotoInput";

export const MAX_REPORT_PHOTOS = 2;
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type Item = Photo & { key: string };

function Thumb({ item, onRemove }: { item: Item; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(item.blob);
    const t = setTimeout(() => setUrl(u), 0);
    return () => {
      clearTimeout(t);
      URL.revokeObjectURL(u);
    };
  }, [item.blob]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-card-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview
        <img src={url} alt={`Selected photo ${item.name}`} className="h-36 w-full object-cover" />
      ) : (
        <div className="h-36 animate-pulse" />
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
        <span className="min-w-0 truncate text-fg">{item.name}</span>
        <span className="shrink-0 text-muted">{formatBytes(item.blob.size)}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
        aria-label={`Remove ${item.name}`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/** Pick up to 2 photos; each is compressed in the browser and previewed. */
export function PhotosInput({
  value,
  onChange,
  error,
}: {
  value: Photo[];
  onChange: (photos: Photo[]) => void;
  error?: string;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const items: Item[] = value.map((p, i) => ({ ...p, key: `${i}-${p.name}-${p.blob.size}` }));
  const remaining = MAX_REPORT_PHOTOS - value.length;

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setMessage(null);
    const files = Array.from(list);
    if (files.length > remaining) {
      setMessage(
        remaining === 0
          ? `You can upload at most ${MAX_REPORT_PHOTOS} photos. Remove one to add another.`
          : `You can upload at most ${MAX_REPORT_PHOTOS} photos — only the first ${remaining} ${remaining === 1 ? "was" : "were"} added.`,
      );
    }
    setBusy(true);
    const added: Photo[] = [];
    for (const file of files.slice(0, Math.max(0, remaining))) {
      if (!file.type.startsWith("image/")) {
        setMessage(`"${file.name}" is not an image.`);
        continue;
      }
      if (file.size > MAX_ORIGINAL_BYTES) {
        setMessage(`"${file.name}" is too large (max 25 MB).`);
        continue;
      }
      const blob = await compressImage(file);
      if (blob.size > MAX_UPLOAD_BYTES) {
        setMessage(`"${file.name}" is still over 10 MB after compression.`);
        continue;
      }
      added.push({ blob, name: file.name });
    }
    setBusy(false);
    if (added.length) onChange([...value, ...added].slice(0, MAX_REPORT_PHOTOS));
  }

  const shown = message ?? error;

  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={remaining === 0 || busy}
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className={`grid gap-3 ${items.length ? "sm:grid-cols-2" : ""}`}>
        {items.map((item, i) => (
          <Thumb key={item.key} item={item} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
        ))}

        {remaining > 0 && (
          <label
            htmlFor={id}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card-2/50 px-4 text-center transition-colors hover:border-blue-500/60 hover:bg-card-2 ${
              items.length ? "min-h-[11.5rem]" : "py-8"
            } ${shown && !items.length ? "border-rose-500" : "border-line"}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void addFiles(e.dataTransfer.files);
            }}
          >
            {busy ? (
              <Loader2 className="size-8 animate-spin text-accent" />
            ) : items.length ? (
              <ImagePlus className="size-8 text-accent" />
            ) : (
              <Camera className="size-8 text-accent" />
            )}
            <span className="font-medium text-fg">
              {busy ? "Preparing photo…" : items.length ? "Add another photo" : "Take or upload photos"}
            </span>
            <span className="text-xs text-muted">
              {items.length ? `${remaining} more allowed` : `Up to ${MAX_REPORT_PHOTOS} photos · JPEG, PNG or WebP · compressed automatically`}
            </span>
          </label>
        )}
      </div>

      <p className={`mt-1.5 text-xs ${shown ? "text-rose-500" : "text-subtle"}`}>
        {shown ?? `${value.length} of ${MAX_REPORT_PHOTOS} photos added`}
      </p>
    </div>
  );
}
