import { useContext, useMemo } from "react";
import { DollarSign, CreditCard, TrendingUp, Flame } from "lucide-react";
import { FilterContext } from "@/App";
import PageContainer from "@/components/layout/PageContainer";
import KPICard from "@/components/dashboard/KPICard";
import BarChartWidget from "@/components/charts/BarChartWidget";
import LineChartWidget from "@/components/charts/LineChartWidget";
import PieChartWidget from "@/components/charts/PieChartWidget";
import GaugeChart from "@/components/charts/GaugeChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { formatCurrency, periodToLabel } from "@/lib/utils";
import { CHART_COLORS, CATEGORY_COLORS } from "@/lib/constants";
import type { DashboardSummary } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Skeleton placeholders while loading                                       */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

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
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Safely coerce any value to a finite number (0 fallback). */
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const vndFormatter = (v: number) => formatCurrency(v, "VND");

/* -------------------------------------------------------------------------- */
/*  Overview page                                                              */
/* -------------------------------------------------------------------------- */

export default function Overview() {
  const { filters } = useContext(FilterContext);

  const { data, loading } = useApi<DashboardSummary>(
    `summary.php?period=${filters.period}`,
    [filters.period]
  );

  /* ---- Revenue vs Expenses grouped bar chart data ---- */
  const revenueVsExpenseData = useMemo(() => {
    if (!data?.monthly_trend || !Array.isArray(data.monthly_trend)) return [];
    return data.monthly_trend.map((m) => ({
      period: periodToLabel(String(m.period ?? "")),
      revenue: num(m.revenue),
      opex: num(m.opex),
    }));
  }, [data]);

  /* ---- Monthly trend line chart data (revenue, cogs, opex, net) ---- */
  const trendData = useMemo(() => {
    if (!data?.monthly_trend || !Array.isArray(data.monthly_trend)) return [];
    return data.monthly_trend.map((m) => ({
      period: periodToLabel(String(m.period ?? "")),
      revenue: num(m.revenue),
      cogs: num(m.cogs),
      opex: num(m.opex),
      net: num(m.net),
    }));
  }, [data]);

  /* ---- Expense breakdown pie/donut data ---- */
  const expensePieData = useMemo(() => {
    if (!data?.expense_by_category || !Array.isArray(data.expense_by_category))
      return [];
    return data.expense_by_category.map((item) => ({
      name: String(item.name ?? ""),
      value: num(item.amount),
      color:
        item.color ||
        CATEGORY_COLORS[String(item.name ?? "").toLowerCase()] ||
        CHART_COLORS.muted,
    }));
  }, [data]);

  /* ---- Runway gauge: cash / burn_rate (months) ---- */
  const runwayMonths = useMemo(() => {
    if (!data) return 0;
    const burnRate = num(data.burn_rate);
    if (burnRate <= 0) return 0;
    const cash = num(data.total_revenue) - num(data.total_cogs) - num(data.total_opex);
    if (cash <= 0) return 0;
    return Math.round(cash / burnRate);
  }, [data]);

  /* ---- Loading state ---- */
  if (loading || !data) {
    return (
      <PageContainer
        title="Tong quan"
        description="Buc tranh tai chinh toan canh"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonChart key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  /* ---- Derived KPI values ---- */
  const totalRevenue = num(data.total_revenue);
  const totalCogs = num(data.total_cogs);
  const totalOpex = num(data.total_opex);
  const netProfit = num(data.net_profit);
  const burnRate = num(data.burn_rate);
  const totalExpenses = totalCogs + totalOpex;
  const profitMargin =
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <PageContainer
      title="Tong quan"
      description="Buc tranh tai chinh toan canh"
    >
      {/* ---- 4 KPI Cards Row ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tong Doanh thu"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          trend={totalRevenue > 0 ? "up" : "flat"}
          change={totalRevenue > 0 ? profitMargin : undefined}
          changeLabel="margin"
        />
        <KPICard
          title="Tong Chi phi"
          value={formatCurrency(totalExpenses)}
          icon={<CreditCard className="h-6 w-6" />}
          trend={totalExpenses > totalRevenue ? "up" : "down"}
        />
        <KPICard
          title="Loi nhuan rong"
          value={formatCurrency(netProfit)}
          icon={<TrendingUp className="h-6 w-6" />}
          change={profitMargin}
          changeLabel="ty suat"
          trend={netProfit >= 0 ? "up" : "down"}
        />
        <KPICard
          title="Burn Rate"
          value={formatCurrency(burnRate)}
          icon={<Flame className="h-6 w-6" />}
          trend={burnRate > 0 ? "down" : "flat"}
          changeLabel="/ thang"
        />
      </div>

      {/* ---- 4 Charts Grid (1 col mobile, 2 col tablet+) ---- */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Revenue vs Expenses grouped bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu vs Chi phi</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="BarChart">
              {revenueVsExpenseData.length > 0 ? (
                <BarChartWidget
                  data={revenueVsExpenseData}
                  xKey="period"
                  bars={[
                    {
                      key: "revenue",
                      name: "Doanh thu",
                      color: CHART_COLORS.green,
                    },
                    {
                      key: "opex",
                      name: "Chi phi van hanh",
                      color: CHART_COLORS.red,
                    },
                  ]}
                  formatValue={vndFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  Khong co du lieu
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* 2. Monthly Trend line chart (revenue, cogs, opex, net) */}
        <Card>
          <CardHeader>
            <CardTitle>Xu huong hang thang</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="LineChart">
              {trendData.length > 0 ? (
                <LineChartWidget
                  data={trendData}
                  xKey="period"
                  lines={[
                    {
                      key: "revenue",
                      name: "Doanh thu",
                      color: CHART_COLORS.green,
                    },
                    { key: "cogs", name: "Gia von", color: CHART_COLORS.orange },
                    {
                      key: "opex",
                      name: "Chi phi van hanh",
                      color: CHART_COLORS.red,
                    },
                    {
                      key: "net",
                      name: "Loi nhuan rong",
                      color: CHART_COLORS.blue,
                    },
                  ]}
                  formatValue={vndFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  Khong co du lieu
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* 3. Expense Breakdown donut chart (innerRadius=60) */}
        <Card>
          <CardHeader>
            <CardTitle>Phan bo chi phi</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="PieChart">
              {expensePieData.length > 0 ? (
                <PieChartWidget
                  data={expensePieData}
                  innerRadius={60}
                  formatValue={vndFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  Khong co du lieu chi phi
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* 4. Runway Gauge (cash / burn_rate) */}
        <Card>
          <CardHeader>
            <CardTitle>Runway du kien</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ErrorBoundary name="GaugeChart">
              <GaugeChart
                value={runwayMonths}
                max={24}
                label="Runway con lai"
                unit="thang"
                color={
                  runwayMonths > 12
                    ? CHART_COLORS.green
                    : runwayMonths > 6
                      ? CHART_COLORS.warning
                      : CHART_COLORS.destructive
                }
                size={220}
              />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
