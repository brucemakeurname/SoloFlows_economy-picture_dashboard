import { useCallback, useMemo } from "react";
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
    if (categoryId !== undefined) params.set("category_id", String(categoryId));
    const qs = params.toString();
    return `accounts.php${qs ? `?${qs}` : ""}`;
  }, [categoryId]);

  const { data, loading, error, refetch } = useApi<Account[]>(endpoint, [
    categoryId,
  ]);

  // CRUD ops are no-ops in static mode
  const createAccount = useCallback(
    async (body: Omit<Account, "id">): Promise<Account> => {
      console.warn("[Static mode] createAccount is disabled");
      return { id: 0, ...body } as Account;
    },
    []
  );

  const updateAccount = useCallback(
    async (id: number, body: Partial<Account>): Promise<Account> => {
      console.warn("[Static mode] updateAccount is disabled");
      return { id, ...body } as Account;
    },
    []
  );

  const deleteAccount = useCallback(async (_id: number): Promise<void> => {
    console.warn("[Static mode] deleteAccount is disabled");
  }, []);

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
