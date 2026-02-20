import { useContext, useMemo, useState } from "react";
import { Gauge, Target, TrendingUp, AlertTriangle } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import KPICard from "@/components/dashboard/KPICard";
import { useKPI } from "@/hooks/useKPI";
import { cn, formatNumber } from "@/lib/utils";
import { KPI_STATUS_CONFIG } from "@/lib/constants";
import { FilterContext } from "@/App";
import type { KPIMetric } from "@/lib/types";

const GROUP_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "growth", label: "Growth" },
  { value: "product", label: "Product" },
];

function statusToBadgeVariant(
  status: KPIMetric["status"]
): "success" | "warning" | "destructive" {
  switch (status) {
    case "on_track":
      return "success";
    case "warning":
      return "warning";
    case "off_track":
      return "destructive";
  }
}

function KPIMetricCard({ kpi }: { kpi: KPIMetric }) {
  const progress = useMemo(() => {
    if (!kpi.target_value || kpi.target_value === 0) return 0;
    return Math.min((kpi.current_value / kpi.target_value) * 100, 100);
  }, [kpi.current_value, kpi.target_value]);

  const statusConfig = KPI_STATUS_CONFIG[kpi.status];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Header: Name + Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-foreground">
            {kpi.name}
          </h3>
          <Badge variant={statusToBadgeVariant(kpi.status)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Current Value */}
        <div className="mt-3">
          <p className="text-2xl font-extrabold tracking-tight text-foreground">
            {formatNumber(kpi.current_value)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {kpi.unit}
            </span>
          </p>
        </div>

        {/* Target vs Actual Progress Bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Current: {formatNumber(kpi.current_value)}</span>
            <span>Target: {formatNumber(kpi.target_value ?? 0)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted">
            <div
              className={cn(
                "h-2.5 rounded-full transition-all duration-500",
                kpi.status === "on_track" && "bg-success",
                kpi.status === "warning" && "bg-warning",
                kpi.status === "off_track" && "bg-destructive"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs font-medium text-muted-foreground">
            {progress.toFixed(0)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPIGrid({
  kpis,
  loading,
}: {
  kpis: KPIMetric[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <Target className="mr-2 h-5 w-5" />
        No KPI metrics in this group
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KPIMetricCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

export default function KPIDashboard() {
  const { filters } = useContext(FilterContext);
  const [selectedGroup, setSelectedGroup] = useState("all");

  const groupParam = selectedGroup === "all" ? undefined : selectedGroup;
  const { kpis, loading } = useKPI(filters.period, groupParam);

  // Summary counts by status
  const statusCounts = useMemo(() => {
    const counts = { on_track: 0, warning: 0, off_track: 0, total: 0 };
    for (const kpi of kpis) {
      counts[kpi.status]++;
      counts.total++;
    }
    return counts;
  }, [kpis]);

  return (
    <PageContainer title="KPI Dashboard" description="Track performance metrics">
      <div className="space-y-6">
        {/* Summary KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Metrics"
            value={String(statusCounts.total)}
            icon={<Gauge className="h-6 w-6" />}
            trend="flat"
          />
          <KPICard
            title="On Track"
            value={String(statusCounts.on_track)}
            icon={<Target className="h-6 w-6" />}
            trend="up"
          />
          <KPICard
            title="Warning"
            value={String(statusCounts.warning)}
            icon={<AlertTriangle className="h-6 w-6" />}
            trend="flat"
          />
          <KPICard
            title="Off Track"
            value={String(statusCounts.off_track)}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="down"
          />
        </div>

        {/* Filter Tabs by Group */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
            {GROUP_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedGroup(tab.value)}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  selectedGroup === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <KPIGrid kpis={kpis} loading={loading} />
        </div>
      </div>
    </PageContainer>
  );
}
