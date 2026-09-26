"use client";

import { Camera, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { compressImage, formatBytes } from "@/lib/image";

export type Photo = { blob: Blob; name: string };

const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Pick or take a photo; it is compressed in the browser and previewed. */
export function PhotoInput({
  value,
  onChange,
  error,
}: {
  value: Photo | null;
  onChange: (p: Photo | null) => void;
  error?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Create (and later revoke) an object URL for the preview.
  useEffect(() => {
    if (!value) return;
    const url = URL.createObjectURL(value.blob);
    const t = setTimeout(() => setPreview(url), 0);
    return () => {
      clearTimeout(t);
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [value]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setLocalError(null);
    if (!file.type.startsWith("image/")) {
      setLocalError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setLocalError("That photo is too large. Please choose one under 25 MB.");
      return;
    }
    setBusy(true);
    const blob = await compressImage(file);
    setBusy(false);
    if (blob.size > MAX_UPLOAD_BYTES) {
      setLocalError("That photo is still larger than 10 MB after compression. Try another one.");
      return;
    }
    onChange({ blob, name: file.name });
  }

  const shownError = localError ?? error;

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      {value && preview ? (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-card-2 p-3 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img src={preview} alt="Selected photo of the issue" className="h-40 w-full rounded-lg object-cover sm:h-28 sm:w-40" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="truncate font-medium text-fg">{value.name}</p>
            <p className="text-muted">{formatBytes(value.blob.size)} · ready to upload</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-fg hover:bg-card"
              >
                <RefreshCw className="size-3.5" /> Change
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-card"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card-2/50 px-4 py-8 text-center transition-colors hover:border-blue-500/60 hover:bg-card-2 ${
            shownError ? "border-rose-500" : "border-line"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          {busy ? <Loader2 className="size-8 animate-spin text-accent" /> : <Camera className="size-8 text-accent" />}
          <span className="font-medium text-fg">{busy ? "Preparing photo…" : "Take or upload a photo"}</span>
          <span className="text-xs text-muted">JPEG, PNG or WebP · photos are compressed automatically</span>
        </label>
      )}

      {shownError && <p className="mt-1.5 text-xs text-rose-500">{shownError}</p>}
    </div>
  );
}
