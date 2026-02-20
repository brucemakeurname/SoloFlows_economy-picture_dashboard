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

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const fmt = (v: number) => formatCurrency(v);

export default function Overview() {
  const { filters } = useContext(FilterContext);
  const { data, loading } = useApi<DashboardSummary>(
    `summary.php?period=${filters.period}`,
    [filters.period]
  );

  const revenueVsExpenseData = useMemo(() => {
    if (!data?.monthly_trend || !Array.isArray(data.monthly_trend)) return [];
    return data.monthly_trend.map((m) => ({
      period: periodToLabel(String(m.period ?? "")),
      revenue: num(m.revenue),
      opex: num(m.opex),
    }));
  }, [data]);

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

  const expensePieData = useMemo(() => {
    if (!data?.expense_by_category || !Array.isArray(data.expense_by_category)) return [];
    return data.expense_by_category.map((item) => ({
      name: String(item.name ?? ""),
      value: num(item.amount),
      color: item.color || CATEGORY_COLORS[String(item.name ?? "").toLowerCase()] || CHART_COLORS.muted,
    }));
  }, [data]);

  const runwayMonths = useMemo(() => {
    if (!data) return 0;
    const burnRate = num(data.burn_rate);
    if (burnRate <= 0) return 0;
    const cash = num(data.total_revenue) - num(data.total_cogs) - num(data.total_opex);
    if (cash <= 0) return 0;
    return Math.round(cash / burnRate);
  }, [data]);

  if (loading || !data) {
    return (
      <PageContainer title="Overview" description="Full financial picture">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3"><div className="h-12 animate-pulse rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  const totalRevenue = num(data.total_revenue);
  const totalCogs = num(data.total_cogs);
  const totalOpex = num(data.total_opex);
  const netProfit = num(data.net_profit);
  const burnRate = num(data.burn_rate);
  const totalExpenses = totalCogs + totalOpex;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <PageContainer title="Overview" description="Full financial picture">
      {/* KPI Cards — 4 across */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={totalRevenue > 0 ? "up" : "flat"}
          change={totalRevenue > 0 ? profitMargin : undefined}
          changeLabel="margin"
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<CreditCard className="h-4 w-4" />}
          trend={totalExpenses > totalRevenue ? "up" : "down"}
        />
        <KPICard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={<TrendingUp className="h-4 w-4" />}
          change={profitMargin}
          changeLabel="margin"
          trend={netProfit >= 0 ? "up" : "down"}
        />
        <KPICard
          title="Burn Rate"
          value={formatCurrency(burnRate)}
          icon={<Flame className="h-4 w-4" />}
          trend={burnRate > 0 ? "down" : "flat"}
          changeLabel="/mo"
        />
      </div>

      {/* Charts — 2x2 grid, compact 200px height */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm">Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <ErrorBoundary name="BarChart">
              {revenueVsExpenseData.length > 0 ? (
                <BarChartWidget
                  data={revenueVsExpenseData}
                  xKey="period"
                  bars={[
                    { key: "revenue", name: "Revenue", color: CHART_COLORS.green },
                    { key: "opex", name: "OpEx", color: CHART_COLORS.red },
                  ]}
                  height={200}
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
              {trendData.length > 0 ? (
                <LineChartWidget
                  data={trendData}
                  xKey="period"
                  lines={[
                    { key: "revenue", name: "Revenue", color: CHART_COLORS.green },
                    { key: "cogs", name: "COGS", color: CHART_COLORS.orange },
                    { key: "opex", name: "OpEx", color: CHART_COLORS.red },
                    { key: "net", name: "Net", color: CHART_COLORS.blue },
                  ]}
                  height={200}
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
            <CardTitle className="text-sm">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <ErrorBoundary name="PieChart">
              {expensePieData.length > 0 ? (
                <PieChartWidget data={expensePieData} innerRadius={40} height={200} formatValue={fmt} />
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm">Runway</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center px-2 pb-2 pt-0">
            <ErrorBoundary name="GaugeChart">
              <GaugeChart
                value={runwayMonths}
                max={24}
                label="Remaining"
                unit="months"
                color={runwayMonths > 12 ? CHART_COLORS.green : runwayMonths > 6 ? CHART_COLORS.warning : CHART_COLORS.destructive}
                size={160}
              />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
