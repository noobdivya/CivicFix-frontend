"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Loads data from the API whenever `key` changes. `reload()` fetches again
 * while keeping the current data on screen.
 */
export function useApi<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    fetcher()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
    // Re-run only when the key changes or reload() is called.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading: data === undefined && error === null, reload, setData };
}
