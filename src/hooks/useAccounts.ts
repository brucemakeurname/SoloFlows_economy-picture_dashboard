import { useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/lib/types";
import { useApi } from "@/hooks/useApi";

interface UseAccountsResult {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  createAccount: (data: Omit<Account, "id">) => Promise<Account>;
  updateAccount: (id: number, data: Partial<Account>) => Promise<Account>;
  deleteAccount: (id: number) => Promise<void>;
  refetch: () => void;
}

export function useAccounts(categoryId?: number): UseAccountsResult {
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (categoryId !== undefined) {
      params.set("category_id", String(categoryId));
    }
    const qs = params.toString();
    return `accounts.php${qs ? `?${qs}` : ""}`;
  }, [categoryId]);

  const { data, loading, error, refetch } = useApi<Account[]>(endpoint, [
    categoryId,
  ]);

  const createAccount = useCallback(
    async (body: Omit<Account, "id">): Promise<Account> => {
      const res = await api.post<Account>("accounts.php", body);
      refetch();
      return res.data;
    },
    [refetch]
  );

  const updateAccount = useCallback(
    async (id: number, body: Partial<Account>): Promise<Account> => {
      const res = await api.put<Account>(`accounts.php?id=${id}`, body);
      refetch();
      return res.data;
    },
    [refetch]
  );

  const deleteAccount = useCallback(
    async (id: number): Promise<void> => {
      await api.delete<void>(`accounts.php?id=${id}`);
      refetch();
    },
    [refetch]
  );

  return {
    accounts: data ?? [],
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch,
  };
}
