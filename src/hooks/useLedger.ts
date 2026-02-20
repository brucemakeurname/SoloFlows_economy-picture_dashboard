import { useCallback, useMemo } from "react";
import type { LedgerEntry } from "@/lib/types";
import { useApi } from "@/hooks/useApi";

interface UseLedgerResult {
  entries: LedgerEntry[];
  loading: boolean;
  error: string | null;
  createEntry: (data: Omit<LedgerEntry, "id">) => Promise<LedgerEntry>;
  updateEntry: (
    id: number,
    data: Partial<LedgerEntry>
  ) => Promise<LedgerEntry>;
  deleteEntry: (id: number) => Promise<void>;
  refetch: () => void;
}

export function useLedger(
  period?: string,
  categoryType?: string
): UseLedgerResult {
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (period) params.set("period", period);
    if (categoryType) params.set("category_type", categoryType);
    const qs = params.toString();
    return `ledger.php${qs ? `?${qs}` : ""}`;
  }, [period, categoryType]);

  const { data, loading, error, refetch } = useApi<LedgerEntry[]>(endpoint, [
    period,
    categoryType,
  ]);

  // CRUD ops are no-ops in static mode (data is read-only)
  const createEntry = useCallback(
    async (body: Omit<LedgerEntry, "id">): Promise<LedgerEntry> => {
      console.warn("[Static mode] createEntry is disabled");
      return { id: 0, ...body } as LedgerEntry;
    },
    []
  );

  const updateEntry = useCallback(
    async (id: number, body: Partial<LedgerEntry>): Promise<LedgerEntry> => {
      console.warn("[Static mode] updateEntry is disabled");
      return { id, ...body } as LedgerEntry;
    },
    []
  );

  const deleteEntry = useCallback(async (_id: number): Promise<void> => {
    console.warn("[Static mode] deleteEntry is disabled");
  }, []);

  return {
    entries: data ?? [],
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch,
  };
}
