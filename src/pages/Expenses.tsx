import { useContext, useMemo } from "react";
import { TrendingDown, DollarSign, ArrowDownRight, BarChart3 } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import BarChartWidget from "@/components/charts/BarChartWidget";
import LineChartWidget from "@/components/charts/LineChartWidget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import { FilterContext } from "@/App";
import type { DashboardSummary } from "@/lib/types";

const COLOR_LIST = [
  CHART_COLORS.red,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
  CHART_COLORS.blue,
  CHART_COLORS.green,
];

export default function Expenses() {
  const { filters } = useContext(FilterContext);
  const endpoint = filters.period
    ? `summary.php?period=${filters.period}`
    : "summary.php";
  const { data: summary, loading, error } = useApi<DashboardSummary>(endpoint);

  const expenseBreakdown = useMemo(() => {
    if (!summary?.expense_by_category) return [];
    return summary.expense_by_category
      .map((item, index) => ({
        name: item.name,
        amount: item.amount,
        color: item.color || COLOR_LIST[index % COLOR_LIST.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary?.expense_by_category]);

  const topFiveExpenses = expenseBreakdown.slice(0, 5);

  const cogsVsOpex = useMemo(() => {
    if (!summary) return [];
    return [
      { category: "COGS", amount: summary.total_cogs, color: CHART_COLORS.orange },
      { category: "OpEx", amount: summary.total_opex, color: CHART_COLORS.red },
    ];
  }, [summary]);

  const costTrend = useMemo(() => {
    if (!summary?.monthly_trend) return [];
    return summary.monthly_trend.map((item) => ({
      period: item.period,
      cogs: item.cogs,
      opex: item.opex,
      total: item.cogs + item.opex,
    }));
  }, [summary?.monthly_trend]);

  if (error) {
    return (
      <PageContainer title="Chi phi" description="Phan tich chi phi va xu huong">
        <div className="flex items-center justify-center py-12 text-destructive">
          Khong the tai du lieu chi phi.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Chi phi" description="Phan tich chi phi va xu huong">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Phan bo chi phi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[350px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : expenseBreakdown.length === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                Khong co du lieu chi phi
              </div>
            ) : (
              <BarChartWidget
                data={expenseBreakdown}
                xKey="name"
                bars={[{ key: "amount", color: CHART_COLORS.red, name: "So tien" }]}
                horizontal
                height={350}
                formatValue={(v) => formatCurrency(v)}
              />
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <TrendingDown className="h-5 w-5 text-primary" />
            Top 5 chi phi lon nhat
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-20 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))
              : topFiveExpenses.map((expense, index) => (
                  <Card key={expense.name} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-bold text-destructive">
                          #{index + 1}
                        </span>
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-foreground">
                        {expense.name}
                      </p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div
                        className="absolute bottom-0 left-0 h-1 w-full"
                        style={{ backgroundColor: expense.color }}
                      />
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                So sanh COGS va OpEx
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[350px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <BarChartWidget
                  data={cogsVsOpex}
                  xKey="category"
                  bars={[{ key: "amount", color: CHART_COLORS.purple, name: "So tien" }]}
                  height={350}
                  formatValue={(v) => formatCurrency(v)}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Xu huong chi phi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[350px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : costTrend.length === 0 ? (
                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                  Khong co du lieu xu huong
                </div>
              ) : (
                <LineChartWidget
                  data={costTrend}
                  xKey="period"
                  lines={[
                    { key: "cogs", color: CHART_COLORS.orange, name: "COGS" },
                    { key: "opex", color: CHART_COLORS.red, name: "OpEx" },
                    { key: "total", color: CHART_COLORS.muted, name: "Tong" },
                  ]}
                  height={350}
                  formatValue={(v) => formatCurrency(v)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
