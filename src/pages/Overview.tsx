import { useContext, useMemo } from "react";
import { DollarSign, CreditCard, TrendingUp, Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
    const cash = num(data.available_cash);
    if (cash <= 0) return 0;
    return Math.round((cash / burnRate) * 10) / 10;
  }, [data]);

  if (loading || !data) {
    return (
      <PageContainer title="Overview" description="Full financial picture">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 stagger-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3"><div className="h-16 animate-pulse rounded-lg bg-muted/50" /></CardContent></Card>
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

  const budgetRevenue = num(data.budget_revenue);
  const revenuePct = budgetRevenue > 0 ? ((totalRevenue / budgetRevenue) * 100).toFixed(0) : "0";

  return (
    <PageContainer title="Overview" description="Full financial picture">
      {/* Quick snapshot bar */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-medium text-foreground">Feb 2026</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          Revenue at <span className="font-bold text-primary">{revenuePct}%</span> of budget
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {netProfit >= 0 ? (
            <ArrowUpRight className="h-3 w-3 text-success" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-destructive" />
          )}
          <span className={netProfit >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
            {formatCurrency(netProfit)}
          </span>
          net
        </div>
      </div>

      {/* KPI Cards — 4 across */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 stagger-grid">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={totalRevenue > 0 ? "up" : "flat"}
          change={totalRevenue > 0 ? profitMargin : undefined}
          changeLabel="margin"
          accent={CHART_COLORS.green}
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<CreditCard className="h-5 w-5" />}
          trend={totalExpenses > totalRevenue ? "up" : "down"}
          accent={CHART_COLORS.orange}
        />
        <KPICard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={<TrendingUp className="h-5 w-5" />}
          change={profitMargin}
          changeLabel="margin"
          trend={netProfit >= 0 ? "up" : "down"}
          accent={netProfit >= 0 ? CHART_COLORS.green : CHART_COLORS.red}
        />
        <KPICard
          title="Burn Rate"
          value={formatCurrency(burnRate)}
          icon={<Flame className="h-5 w-5" />}
          trend={burnRate > 0 ? "down" : "flat"}
          changeLabel="/mo"
          accent={CHART_COLORS.red}
        />
      </div>

      {/* Charts — 2x2 grid, compact 200px height */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 stagger-grid">
        <Card className="hover:shadow-md">
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm font-semibold">Revenue vs Expenses</CardTitle>
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

        <Card className="hover:shadow-md">
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm font-semibold">Monthly Trend</CardTitle>
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

        <Card className="hover:shadow-md">
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm font-semibold">Expense Breakdown</CardTitle>
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

        <Card className="hover:shadow-md">
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm font-semibold">Runway</CardTitle>
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
