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

const STATUS_GRADIENT = {
  on_track: "from-success/10 to-transparent",
  warning: "from-warning/10 to-transparent",
  off_track: "from-destructive/10 to-transparent",
} as const;

const STATUS_BAR_COLOR = {
  on_track: "bg-success",
  warning: "bg-warning",
  off_track: "bg-destructive",
} as const;

function KPIMetricCard({ kpi }: { kpi: KPIMetric }) {
  const progress = useMemo(() => {
    if (!kpi.target_value || kpi.target_value === 0) return 0;
    return Math.min((kpi.current_value / kpi.target_value) * 100, 100);
  }, [kpi.current_value, kpi.target_value]);

  const statusConfig = KPI_STATUS_CONFIG[kpi.status];

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Subtle gradient overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", STATUS_GRADIENT[kpi.status])} />
      <CardContent className="relative p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-xs font-semibold leading-tight text-foreground">{kpi.name}</h3>
          <Badge variant={statusToBadgeVariant(kpi.status)}>{statusConfig.label}</Badge>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl font-extrabold tracking-tight text-foreground font-mono">{formatNumber(kpi.current_value)}</span>
          <span className="text-[10px] text-muted-foreground">{kpi.unit}</span>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">/ {formatNumber(kpi.target_value ?? 0)}</span>
        </div>

        {/* Progress bar with animation */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-700 ease-out",
              STATUS_BAR_COLOR[kpi.status]
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="capitalize">{kpi.group_name}</span>
          <span className="font-semibold">{progress.toFixed(0)}%</span>
        </div>
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

  const healthScore = useMemo(() => {
    if (statusCounts.total === 0) return 0;
    return Math.round(((statusCounts.on_track * 100 + statusCounts.warning * 50) / statusCounts.total));
  }, [statusCounts]);

  return (
    <PageContainer title="KPI Dashboard" description="Track performance metrics">
      {/* Status bar with health score */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9">
              <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-muted)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke={healthScore >= 70 ? "var(--color-success)" : healthScore >= 40 ? "var(--color-warning)" : "var(--color-destructive)"}
                  strokeWidth="3"
                  strokeDasharray={`${healthScore * 0.94} 94`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{healthScore}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Health</p>
              <p className="text-xs font-bold">{statusCounts.total} KPIs</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><Target className="h-3.5 w-3.5 text-success" /><span className="font-bold text-success">{statusCounts.on_track}</span></div>
            <div className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-warning" /><span className="font-bold text-warning">{statusCounts.warning}</span></div>
            <div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-destructive" /><span className="font-bold text-destructive">{statusCounts.off_track}</span></div>
          </div>
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-xl bg-muted/50 p-1">
          {GROUP_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedGroup(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
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

      {/* KPI Grid */}
      {loading ? (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 stagger-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3"><div className="space-y-2"><div className="h-3 w-2/3 animate-pulse rounded bg-muted" /><div className="h-5 w-1/2 animate-pulse rounded bg-muted" /><div className="h-1.5 w-full animate-pulse rounded-full bg-muted" /></div></CardContent></Card>
          ))}
        </div>
      ) : kpis.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          <Gauge className="mr-2 h-4 w-4" />No KPI metrics in this group
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 stagger-grid">
          {kpis.map((kpi) => <KPIMetricCard key={kpi.id} kpi={kpi} />)}
        </div>
      )}
    </PageContainer>
  );
}
