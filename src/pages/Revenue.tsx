import { useContext, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { FilterContext } from "@/App";
import PageContainer from "@/components/layout/PageContainer";
import KPICard from "@/components/dashboard/KPICard";
import BarChartWidget from "@/components/charts/BarChartWidget";
import LineChartWidget from "@/components/charts/LineChartWidget";
import PieChartWidget from "@/components/charts/PieChartWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { useLedger } from "@/hooks/useLedger";
import { formatCurrency, formatPercent, periodToLabel } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import type { DashboardSummary } from "@/lib/types";

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const fmt = (v: number) => formatCurrency(v);

const CHANNEL_COLORS = [
  CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.orange,
  CHART_COLORS.purple, CHART_COLORS.teal, CHART_COLORS.red,
];

export default function Revenue() {
  const { filters } = useContext(FilterContext);
  const { entries, loading: ledgerLoading } = useLedger(filters.period, "revenue");
  const { data: summary, loading: summaryLoading } = useApi<DashboardSummary>(`summary.php?period=${filters.period}`, [filters.period]);
  const loading = ledgerLoading || summaryLoading;

  const revenueByChannel = useMemo(() => {
    if (!entries.length) return { data: [] as Record<string, unknown>[], subcategories: [] as string[] };
    const subcategorySet = new Set<string>();
    entries.forEach((e) => subcategorySet.add(e.category_name ?? "Other"));
    const subcategories = Array.from(subcategorySet);
    const grouped: Record<string, Record<string, number>> = {};
    entries.forEach((e) => {
      const name = e.account_name ?? e.account_code ?? `#${e.account_id}`;
      const sub = e.category_name ?? "Other";
      if (!grouped[name]) grouped[name] = {};
      grouped[name][sub] = (grouped[name][sub] ?? 0) + num(e.actual);
    });
    return { data: Object.entries(grouped).map(([name, subs]) => ({ name, ...subs })), subcategories };
  }, [entries]);

  const monthlyRevenueTrend = useMemo(() => {
    if (!summary?.revenue_by_period || !Array.isArray(summary.revenue_by_period)) return [];
    return summary.revenue_by_period.map((item) => ({ label: periodToLabel(String(item.period ?? "")), amount: num(item.amount) }));
  }, [summary]);

  const revenueMixData = useMemo(() => {
    if (!summary?.revenue_by_subcategory || !Array.isArray(summary.revenue_by_subcategory)) return [];
    return summary.revenue_by_subcategory.map((item, i) => ({ name: String(item.name ?? ""), value: num(item.amount), color: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }));
  }, [summary]);

  const growthRate = useMemo(() => {
    if (!summary?.revenue_by_period || !Array.isArray(summary.revenue_by_period) || summary.revenue_by_period.length < 2) return 0;
    const sorted = [...summary.revenue_by_period].sort((a, b) => String(a.period).localeCompare(String(b.period)));
    const cur = num(sorted[sorted.length - 1].amount);
    const prev = num(sorted[sorted.length - 2].amount);
    if (prev === 0) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  }, [summary]);

  const totalRevenue = summary?.total_revenue ?? 0;

  if (loading) {
    return (
      <PageContainer title="Revenue" description="Revenue by channel and trend">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3"><div className="h-[180px] animate-pulse rounded bg-muted/50" /></CardContent></Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Revenue" description="Revenue by channel and trend">
      {/* Top row: Growth KPI + inline stats */}
      <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={totalRevenue > 0 ? "up" : "flat"}
        />
        <KPICard
          title="Growth Rate"
          value={formatPercent(growthRate)}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={growthRate > 0 ? "up" : growthRate < 0 ? "down" : "flat"}
          change={growthRate}
          changeLabel="vs prev"
        />
        <Card>
          <CardContent className="px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Channels</p>
            <p className="text-lg font-bold">{revenueMixData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Entries</p>
            <p className="text-lg font-bold">{entries.length}</p>
            {revenueMixData.length > 0 && (
              <p className="truncate text-xs text-muted-foreground">
                Top: {revenueMixData.reduce((max, item) => item.value > max.value ? item : max).name}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts — 3 cols on large, 2 on medium */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm">Revenue by Channel</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <ErrorBoundary name="BarChart">
              {revenueByChannel.data.length > 0 ? (
                <BarChartWidget
                  data={revenueByChannel.data}
                  xKey="name"
                  bars={revenueByChannel.subcategories.map((sub, i) => ({ key: sub, color: CHANNEL_COLORS[i % CHANNEL_COLORS.length], name: sub }))}
                  height={200}
                  stacked
                  formatValue={fmt}
                />
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <ErrorBoundary name="LineChart">
              {monthlyRevenueTrend.length > 0 ? (
                <LineChartWidget data={monthlyRevenueTrend} xKey="label" lines={[{ key: "amount", color: CHART_COLORS.green, name: "Revenue" }]} height={200} formatValue={fmt} />
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm">Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <ErrorBoundary name="PieChart">
              {revenueMixData.length > 0 ? (
                <PieChartWidget data={revenueMixData} height={200} formatValue={fmt} />
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
