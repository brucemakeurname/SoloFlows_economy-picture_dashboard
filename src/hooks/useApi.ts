import { useState, useEffect, useCallback } from "react";
import {
  computeSummary,
  CATEGORIES,
  PERIODS,
  LEDGER_ENTRIES,
  KPI_METRICS,
  ACCOUNTS,
} from "@/data/static-data";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Resolve static data based on the endpoint string that the old API layer used.
 * This removes ALL network calls — data comes from static-data.ts.
 */
function resolveStatic(endpoint: string): unknown {
  const url = new URL(endpoint, "http://localhost");
  const path = url.pathname.replace(/^\//, "");
  const params = url.searchParams;

  if (path === "summary.php") {
    const period = params.get("period") ?? undefined;
    return computeSummary(period);
  }

  if (path === "categories.php") {
    return CATEGORIES;
  }

  if (path === "periods.php") {
    return PERIODS;
  }

  if (path === "ledger.php") {
    let entries = LEDGER_ENTRIES;
    const period = params.get("period");
    if (period) entries = entries.filter((e) => e.period === period);
    const categoryType = params.get("category_type");
    if (categoryType) entries = entries.filter((e) => e.category_type === categoryType);
    return entries;
  }

  if (path === "kpi.php") {
    let kpis = KPI_METRICS;
    const period = params.get("period");
    if (period) kpis = kpis.filter((k) => k.period === period);
    const groupName = params.get("group_name");
    if (groupName) kpis = kpis.filter((k) => k.group_name === groupName);
    return kpis;
  }

  if (path === "accounts.php") {
    const categoryId = params.get("category_id");
    if (categoryId) return ACCOUNTS.filter((a) => a.category_id === Number(categoryId));
    return ACCOUNTS;
  }

  return null;
}

export function useApi<T>(
  endpoint: string,
  deps: unknown[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (endpoint === "") {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate async with microtask so callers see loading=true first
    Promise.resolve().then(() => {
      try {
        const result = resolveStatic(endpoint) as T;
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Static data error");
        setData(null);
      } finally {
        setLoading(false);
      }
    });
  }, [endpoint]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
}
