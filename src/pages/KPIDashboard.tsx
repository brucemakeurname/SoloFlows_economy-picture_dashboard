import { useContext, useMemo, useState } from "react";
import { Gauge, Target, TrendingUp, AlertTriangle } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useKPI } from "@/hooks/useKPI";
import { cn, formatNumber } from "@/lib/utils";
import { KPI_STATUS_CONFIG } from "@/lib/constants";
import { FilterContext } from "@/App";
import type { KPIMetric } from "@/lib/types";

const GROUP_TABS = [
  { value: "all", label: "All" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "growth", label: "Growth" },
  { value: "product", label: "Product" },
];

function statusToBadgeVariant(status: KPIMetric["status"]): "success" | "warning" | "destructive" {
  return status === "on_track" ? "success" : status === "warning" ? "warning" : "destructive";
}

function KPIMetricCard({ kpi }: { kpi: KPIMetric }) {
  const progress = useMemo(() => {
    if (!kpi.target_value || kpi.target_value === 0) return 0;
    return Math.min((kpi.current_value / kpi.target_value) * 100, 100);
  }, [kpi.current_value, kpi.target_value]);

  const statusConfig = KPI_STATUS_CONFIG[kpi.status];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-xs font-semibold leading-tight text-foreground">{kpi.name}</h3>
          <Badge variant={statusToBadgeVariant(kpi.status)}>{statusConfig.label}</Badge>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-xl font-extrabold tracking-tight text-foreground">{formatNumber(kpi.current_value)}</span>
          <span className="text-xs text-muted-foreground">{kpi.unit}</span>
          <span className="ml-auto text-xs text-muted-foreground">/ {formatNumber(kpi.target_value ?? 0)}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              kpi.status === "on_track" && "bg-success",
              kpi.status === "warning" && "bg-warning",
              kpi.status === "off_track" && "bg-destructive"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-0.5 text-right text-[10px] font-medium text-muted-foreground">{progress.toFixed(0)}%</div>
      </CardContent>
    </Card>
  );
}

export default function KPIDashboard() {
  const { filters } = useContext(FilterContext);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const groupParam = selectedGroup === "all" ? undefined : selectedGroup;
  const { kpis, loading } = useKPI(filters.period, groupParam);

  const statusCounts = useMemo(() => {
    const c = { on_track: 0, warning: 0, off_track: 0, total: 0 };
    for (const kpi of kpis) { c[kpi.status]++; c.total++; }
    return c;
  }, [kpis]);

  return (
    <PageContainer title="KPI Dashboard" description="Track performance metrics">
      {/* Compact summary row + group tabs inline */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
          <div className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-bold">{statusCounts.total}</span><span className="text-xs text-muted-foreground">total</span></div>
          <div className="flex items-center gap-1"><Target className="h-3.5 w-3.5 text-success" /><span className="font-bold text-success">{statusCounts.on_track}</span></div>
          <div className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-warning" /><span className="font-bold text-warning">{statusCounts.warning}</span></div>
          <div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-destructive" /><span className="font-bold text-destructive">{statusCounts.off_track}</span></div>
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
          {GROUP_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedGroup(tab.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                selectedGroup === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid — dense 4-5 cols */}
      {loading ? (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3"><div className="space-y-2"><div className="h-3 w-2/3 animate-pulse rounded bg-muted" /><div className="h-5 w-1/2 animate-pulse rounded bg-muted" /><div className="h-1.5 w-full animate-pulse rounded-full bg-muted" /></div></CardContent></Card>
          ))}
        </div>
      ) : kpis.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          <Target className="mr-2 h-4 w-4" />No KPI metrics in this group
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {kpis.map((kpi) => <KPIMetricCard key={kpi.id} kpi={kpi} />)}
        </div>
      )}
    </PageContainer>
  );
}
