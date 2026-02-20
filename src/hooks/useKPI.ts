import { useCallback, useMemo } from "react";
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
    if (period) params.set("period", period);
    if (groupName) params.set("group_name", groupName);
    const qs = params.toString();
    return `kpi.php${qs ? `?${qs}` : ""}`;
  }, [period, groupName]);

  const { data, loading, error, refetch } = useApi<KPIMetric[]>(endpoint, [
    period,
    groupName,
  ]);

  // CRUD ops are no-ops in static mode
  const createKPI = useCallback(
    async (body: Omit<KPIMetric, "id">): Promise<KPIMetric> => {
      console.warn("[Static mode] createKPI is disabled");
      return { id: 0, ...body } as KPIMetric;
    },
    []
  );

  const updateKPI = useCallback(
    async (id: number, body: Partial<KPIMetric>): Promise<KPIMetric> => {
      console.warn("[Static mode] updateKPI is disabled");
      return { id, ...body } as KPIMetric;
    },
    []
  );

  const deleteKPI = useCallback(async (_id: number): Promise<void> => {
    console.warn("[Static mode] deleteKPI is disabled");
  }, []);

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
