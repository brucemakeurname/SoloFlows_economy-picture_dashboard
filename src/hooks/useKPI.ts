import { useCallback, useEffect, useMemo, useState } from "react";
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

let nextLocalId = 2000;

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

  const [kpis, setKpis] = useState<KPIMetric[]>([]);

  useEffect(() => {
    if (data) setKpis(data);
  }, [data]);

  const createKPI = useCallback(
    async (body: Omit<KPIMetric, "id">): Promise<KPIMetric> => {
      const newKPI = { id: nextLocalId++, ...body } as KPIMetric;
      setKpis((prev) => [...prev, newKPI]);
      return newKPI;
    },
    []
  );

  const updateKPI = useCallback(
    async (id: number, body: Partial<KPIMetric>): Promise<KPIMetric> => {
      let updated: KPIMetric | null = null;
      setKpis((prev) =>
        prev.map((k) => {
          if (k.id === id) {
            updated = { ...k, ...body };
            return updated;
          }
          return k;
        })
      );
      return updated ?? ({ id, ...body } as KPIMetric);
    },
    []
  );

  const deleteKPI = useCallback(async (id: number): Promise<void> => {
    setKpis((prev) => prev.filter((k) => k.id !== id));
  }, []);

  return {
    kpis,
    loading,
    error,
    createKPI,
    updateKPI,
    deleteKPI,
    refetch,
  };
}
