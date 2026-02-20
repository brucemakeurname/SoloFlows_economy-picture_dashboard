import { useContext, useMemo } from "react";
import { TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import BarChartWidget from "@/components/charts/BarChartWidget";
import LineChartWidget from "@/components/charts/LineChartWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import { FilterContext } from "@/App";
import type { DashboardSummary } from "@/lib/types";

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const COLOR_LIST = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.teal, CHART_COLORS.blue, CHART_COLORS.green];

export default function Expenses() {
  const { filters } = useContext(FilterContext);
  const endpoint = filters.period ? `summary.php?period=${filters.period}` : "summary.php";
  const { data: summary, loading, error } = useApi<DashboardSummary>(endpoint);

  const expenseBreakdown = useMemo(() => {
    if (!summary?.expense_by_category || !Array.isArray(summary.expense_by_category)) return [];
    return summary.expense_by_category
      .map((item, i) => ({ name: String(item.name ?? ""), amount: num(item.amount), color: item.color || COLOR_LIST[i % COLOR_LIST.length] }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary?.expense_by_category]);

  const cogsVsOpex = useMemo(() => {
    if (!summary) return [];
    return [
      { category: "COGS", amount: num(summary.total_cogs), color: CHART_COLORS.orange },
      { category: "OpEx", amount: num(summary.total_opex), color: CHART_COLORS.red },
    ];
  }, [summary]);

  const costTrend = useMemo(() => {
    if (!summary?.monthly_trend || !Array.isArray(summary.monthly_trend)) return [];
    return summary.monthly_trend.map((item) => ({
      period: String(item.period ?? ""),
      cogs: num(item.cogs),
      opex: num(item.opex),
      total: num(item.cogs) + num(item.opex),
    }));
  }, [summary?.monthly_trend]);

  if (error) {
    return (
      <PageContainer title="Expenses" description="Expense analysis and trends">
        <div className="flex items-center justify-center py-8 text-destructive text-sm">Unable to load expense data.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Expenses" description="Expense analysis and trends">
      {/* Top row: Top expenses as compact list + COGS vs OpEx bar */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Top expenses list */}
        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <TrendingDown className="h-4 w-4 text-primary" />
              Top Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-muted" />)}</div>
            ) : expenseBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div className="space-y-1.5">
                {expenseBreakdown.slice(0, 5).map((exp, i) => (
                  <div key={exp.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold text-destructive bg-destructive/10">
                        {i + 1}
                      </span>
                      <span className="truncate text-xs">{exp.name}</span>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* COGS vs OpEx */}
        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              COGS vs OpEx
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            {loading ? (
              <div className="flex h-[200px] items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
            ) : (
              <ErrorBoundary name="COGSvsOpEx">
                <BarChartWidget data={cogsVsOpex} xKey="category" bars={[{ key: "amount", color: CHART_COLORS.purple, name: "Amount" }]} height={200} formatValue={(v) => formatCurrency(v)} />
              </ErrorBoundary>
            )}
          </CardContent>
        </Card>

        {/* Expense Trend */}
        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              Expense Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            {loading ? (
              <div className="flex h-[200px] items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
            ) : costTrend.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">No data</div>
            ) : (
              <ErrorBoundary name="CostTrend">
                <LineChartWidget
                  data={costTrend}
                  xKey="period"
                  lines={[
                    { key: "cogs", color: CHART_COLORS.orange, name: "COGS" },
                    { key: "opex", color: CHART_COLORS.red, name: "OpEx" },
                    { key: "total", color: CHART_COLORS.muted, name: "Total" },
                  ]}
                  height={200}
                  formatValue={(v) => formatCurrency(v)}
                />
              </ErrorBoundary>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-width expense breakdown bar */}
      <Card className="mt-3">
        <CardHeader className="px-3 py-2">
          <CardTitle className="text-sm">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2 pt-0">
          {loading ? (
            <div className="flex h-[180px] items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : expenseBreakdown.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">No data</div>
          ) : (
            <ErrorBoundary name="ExpenseBar">
              <BarChartWidget
                data={expenseBreakdown}
                xKey="name"
                bars={[{ key: "amount", color: CHART_COLORS.red, name: "Amount" }]}
                horizontal
                height={180}
                formatValue={(v) => formatCurrency(v)}
              />
            </ErrorBoundary>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
