import { useCallback, useMemo } from "react";
import { api } from "@/lib/api";
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
    if (period) {
      params.set("period", period);
    }
    if (categoryType) {
      params.set("category_type", categoryType);
    }
    const qs = params.toString();
    return `ledger.php${qs ? `?${qs}` : ""}`;
  }, [period, categoryType]);

  const { data, loading, error, refetch } = useApi<LedgerEntry[]>(endpoint, [
    period,
    categoryType,
  ]);

  const createEntry = useCallback(
    async (body: Omit<LedgerEntry, "id">): Promise<LedgerEntry> => {
      const res = await api.post<LedgerEntry>("ledger.php", body);
      refetch();
      return res.data;
    },
    [refetch]
  );

  const updateEntry = useCallback(
    async (id: number, body: Partial<LedgerEntry>): Promise<LedgerEntry> => {
      const res = await api.put<LedgerEntry>(`ledger.php?id=${id}`, body);
      refetch();
      return res.data;
    },
    [refetch]
  );

  const deleteEntry = useCallback(
    async (id: number): Promise<void> => {
      await api.delete<void>(`ledger.php?id=${id}`);
      refetch();
    },
    [refetch]
  );

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
