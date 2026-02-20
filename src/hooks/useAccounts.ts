import { useCallback, useEffect, useMemo, useState } from "react";
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

let nextLocalId = 3000;

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

  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (data) setAccounts(data);
  }, [data]);

  const createAccount = useCallback(
    async (body: Omit<Account, "id">): Promise<Account> => {
      const newAccount = { id: nextLocalId++, ...body } as Account;
      setAccounts((prev) => [...prev, newAccount]);
      return newAccount;
    },
    []
  );

  const updateAccount = useCallback(
    async (id: number, body: Partial<Account>): Promise<Account> => {
      let updated: Account | null = null;
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            updated = { ...a, ...body };
            return updated;
          }
          return a;
        })
      );
      return updated ?? ({ id, ...body } as Account);
    },
    []
  );

  const deleteAccount = useCallback(async (id: number): Promise<void> => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch,
  };
}
