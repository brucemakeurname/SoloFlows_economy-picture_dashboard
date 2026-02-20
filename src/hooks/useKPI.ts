import { useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { KPIMetric } from "@/lib/types";
import { useApi } from "@/hooks/useApi";

interface UseKPIResult {
  kpis: KPIMetric[];
  loading: boolean;
  error: string | null;
  createKPI: (data: Omit<KPIMetric, "id">) => Promise<KPIMetric>;
  updateKPI: (id: number, data: Partial<KPIMetric>) => Promise<KPIMetric>;
  deleteKPI: (id: number) => Promise<void>;
  refetch: () => void;
}

export function useKPI(period?: string, groupName?: string): UseKPIResult {
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (period) {
      params.set("period", period);
    }
    if (groupName) {
      params.set("group_name", groupName);
    }
    const qs = params.toString();
    return `kpi.php${qs ? `?${qs}` : ""}`;
  }, [period, groupName]);

  const { data, loading, error, refetch } = useApi<KPIMetric[]>(endpoint, [
    period,
    groupName,
  ]);

  const createKPI = useCallback(
    async (body: Omit<KPIMetric, "id">): Promise<KPIMetric> => {
      const res = await api.post<KPIMetric>("kpi.php", body);
      refetch();
      return res.data;
    },
    [refetch]
  );

  const updateKPI = useCallback(
    async (id: number, body: Partial<KPIMetric>): Promise<KPIMetric> => {
      const res = await api.put<KPIMetric>(`kpi.php?id=${id}`, body);
      refetch();
      return res.data;
    },
    [refetch]
  );

  const deleteKPI = useCallback(
    async (id: number): Promise<void> => {
      await api.delete<void>(`kpi.php?id=${id}`);
      refetch();
    },
    [refetch]
  );

  return {
    kpis: data ?? [],
    loading,
    error,
    createKPI,
    updateKPI,
    deleteKPI,
    refetch,
  };
}
