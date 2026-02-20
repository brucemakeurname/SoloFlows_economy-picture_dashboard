import { useCallback, useEffect, useMemo, useState } from "react";
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

let nextLocalId = 1000;

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

  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  // Sync local state when static data changes (period/filter change)
  useEffect(() => {
    if (data) setEntries(data);
  }, [data]);

  const createEntry = useCallback(
    async (body: Omit<LedgerEntry, "id">): Promise<LedgerEntry> => {
      const newEntry = { id: nextLocalId++, ...body } as LedgerEntry;
      setEntries((prev) => [...prev, newEntry]);
      return newEntry;
    },
    []
  );

  const updateEntry = useCallback(
    async (id: number, body: Partial<LedgerEntry>): Promise<LedgerEntry> => {
      let updated: LedgerEntry | null = null;
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            updated = { ...e, ...body };
            return updated;
          }
          return e;
        })
      );
      return updated ?? ({ id, ...body } as LedgerEntry);
    },
    []
  );

  const deleteEntry = useCallback(async (id: number): Promise<void> => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch,
  };
}
