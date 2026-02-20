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

/* -------------------------------------------------------------------------- */
/*  Skeleton placeholder while loading                                        */
/* -------------------------------------------------------------------------- */

function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full animate-pulse rounded bg-muted/50" />
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CHANNEL_COLORS = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
  CHART_COLORS.red,
  CHART_COLORS.primary,
  CHART_COLORS.accent,
];

/** Safely coerce any value to a finite number (0 fallback). */
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const usdFormatter = (v: number) => formatCurrency(v);

/* -------------------------------------------------------------------------- */
/*  Revenue page                                                               */
/* -------------------------------------------------------------------------- */

export default function Revenue() {
  const { filters } = useContext(FilterContext);

  /* Fetch revenue ledger entries filtered by category_type "revenue" */
  const { entries, loading: ledgerLoading } = useLedger(
    filters.period,
    "revenue"
  );

  /* Fetch summary data for trend & mix charts */
  const { data: summary, loading: summaryLoading } =
    useApi<DashboardSummary>(
      `summary.php?period=${filters.period}`,
      [filters.period]
    );

  const loading = ledgerLoading || summaryLoading;

  /* ---- Revenue by Channel stacked bar (group entries by subcategory) ---- */
  const revenueByChannel = useMemo(() => {
    if (!entries.length)
      return {
        data: [] as Record<string, unknown>[],
        subcategories: [] as string[],
      };

    // Collect unique subcategories from ledger entries
    const subcategorySet = new Set<string>();
    entries.forEach((entry) => {
      const sub = entry.category_name ?? "Other";
      subcategorySet.add(sub);
    });
    const subcategories = Array.from(subcategorySet);

    // Group by account_name, summing actual values per subcategory
    const grouped: Record<string, Record<string, number>> = {};
    entries.forEach((entry) => {
      const accountName =
        entry.account_name ?? entry.account_code ?? `Acct #${entry.account_id}`;
      const sub = entry.category_name ?? "Other";

      if (!grouped[accountName]) {
        grouped[accountName] = {};
      }
      grouped[accountName][sub] =
        (grouped[accountName][sub] ?? 0) + num(entry.actual);
    });

    const data = Object.entries(grouped).map(([name, subs]) => ({
      name,
      ...subs,
    }));

    return { data, subcategories };
  }, [entries]);

  /* ---- Monthly Revenue Trend line chart (from summary.revenue_by_period) ---- */
  const monthlyRevenueTrend = useMemo(() => {
    if (!summary?.revenue_by_period || !Array.isArray(summary.revenue_by_period))
      return [];
    return summary.revenue_by_period.map((item) => ({
      label: periodToLabel(String(item.period ?? "")),
      amount: num(item.amount),
    }));
  }, [summary]);

  /* ---- Revenue Mix pie chart (from summary.revenue_by_subcategory) ---- */
  const revenueMixData = useMemo(() => {
    if (!summary?.revenue_by_subcategory || !Array.isArray(summary.revenue_by_subcategory))
      return [];
    return summary.revenue_by_subcategory.map((item, index) => ({
      name: String(item.name ?? ""),
      value: num(item.amount),
      color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
    }));
  }, [summary]);

  /* ---- Growth rate calculation (current vs previous period) ---- */
  const growthRate = useMemo(() => {
    if (!summary?.revenue_by_period || !Array.isArray(summary.revenue_by_period) || summary.revenue_by_period.length < 2) {
      return 0;
    }
    const sorted = [...summary.revenue_by_period].sort((a, b) =>
      String(a.period).localeCompare(String(b.period))
    );
    const current = num(sorted[sorted.length - 1].amount);
    const previous = num(sorted[sorted.length - 2].amount);

    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, [summary]);

  const totalRevenue = summary?.total_revenue ?? 0;

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <PageContainer
        title="Revenue"
        description="Revenue analysis by channel and trend"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonChart key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Revenue"
      description="Revenue analysis by channel and trend"
    >
      {/* ---- Summary bar ---- */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Total revenue this period:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(totalRevenue)}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Entries:{" "}
          <span className="font-semibold text-foreground">
            {entries.length}
          </span>
        </p>
      </div>

      {/* ---- Charts Grid (responsive 2-col) ---- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Revenue by Channel stacked bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="BarChart">
              {revenueByChannel.data.length > 0 ? (
                <BarChartWidget
                  data={revenueByChannel.data}
                  xKey="name"
                  bars={revenueByChannel.subcategories.map((sub, index) => ({
                    key: sub,
                    color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
                    name: sub,
                  }))}
                  height={350}
                  stacked
                  formatValue={usdFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  No revenue data
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* 2. Monthly Revenue Trend line chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="LineChart">
              {monthlyRevenueTrend.length > 0 ? (
                <LineChartWidget
                  data={monthlyRevenueTrend}
                  xKey="label"
                  lines={[
                    {
                      key: "amount",
                      color: CHART_COLORS.green,
                      name: "Revenue",
                    },
                  ]}
                  height={350}
                  formatValue={usdFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  No trend data
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* 3. Revenue Mix pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="PieChart">
              {revenueMixData.length > 0 ? (
                <PieChartWidget
                  data={revenueMixData}
                  height={350}
                  formatValue={usdFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  No mix data
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* 4. Growth Rate KPI card + detail panel */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <KPICard
              title="Growth Rate"
              value={formatPercent(growthRate)}
              icon={<TrendingUp className="h-6 w-6" />}
              trend={
                growthRate > 0 ? "up" : growthRate < 0 ? "down" : "flat"
              }
              change={growthRate}
              changeLabel="vs previous period"
            />

            {/* Detail breakdown */}
            <div className="space-y-3 rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Growth Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total revenue this period
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Revenue channels
                  </span>
                  <span className="font-medium text-foreground">
                    {revenueMixData.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Entries</span>
                  <span className="font-medium text-foreground">
                    {entries.length}
                  </span>
                </div>
                {revenueMixData.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Top channel
                    </span>
                    <span className="font-medium text-foreground">
                      {
                        revenueMixData.reduce((max, item) =>
                          item.value > max.value ? item : max
                        ).name
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
