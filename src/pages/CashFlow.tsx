import { useContext, useMemo, useCallback } from "react";
import { FilterContext } from "@/App";
import PageContainer from "@/components/layout/PageContainer";
import DataTable from "@/components/dashboard/DataTable";
import EditableCell from "@/components/dashboard/EditableCell";
import BarChartWidget from "@/components/charts/BarChartWidget";
import AreaChartWidget from "@/components/charts/AreaChartWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLedger } from "@/hooks/useLedger";
import { cn, formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import type { LedgerEntry } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Safely coerce any value to a finite number (0 fallback). */
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const usdFormatter = (v: number) => formatCurrency(v);

function varianceBadge(variance: number) {
  if (variance > 0) {
    return (
      <span className="text-sm font-medium text-destructive">
        +{formatCurrency(variance)}
      </span>
    );
  }
  if (variance < 0) {
    return (
      <span className="text-sm font-medium text-success">
        {formatCurrency(variance)}
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {formatCurrency(0)}
    </span>
  );
}

function statusBadge(status: LedgerEntry["status"]) {
  const config: Record<
    LedgerEntry["status"],
    { label: string; variant: "default" | "success" | "warning" | "outline" }
  > = {
    forecast: { label: "Forecast", variant: "warning" },
    actual: { label: "Actual", variant: "success" },
    closed: { label: "Closed", variant: "outline" },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/* -------------------------------------------------------------------------- */
/*  CashFlow page                                                              */
/* -------------------------------------------------------------------------- */

export default function CashFlow() {
  const { filters } = useContext(FilterContext);

  const { entries, loading, updateEntry } = useLedger(filters.period);

  /* ---- Handlers for inline edits ---- */
  const handleBudgetSave = useCallback(
    (entry: LedgerEntry) => (newValue: number) => {
      updateEntry(entry.id, { budget: newValue });
    },
    [updateEntry]
  );

  const handleActualSave = useCallback(
    (entry: LedgerEntry) => (newValue: number) => {
      updateEntry(entry.id, { actual: newValue });
    },
    [updateEntry]
  );

  /* ---- Table column definitions ---- */
  const columns = useMemo(
    () => [
      {
        key: "account_code",
        header: "Code",
        sortable: true,
        render: (row: LedgerEntry) => (
          <span className="font-mono text-sm font-medium text-foreground">
            {row.account_code ?? "---"}
          </span>
        ),
      },
      {
        key: "account_name",
        header: "Account Name",
        sortable: true,
        render: (row: LedgerEntry) => (
          <span className="text-sm text-foreground">
            {row.account_name ?? "---"}
          </span>
        ),
      },
      {
        key: "category_name",
        header: "Category",
        sortable: true,
        render: (row: LedgerEntry) => (
          <Badge variant="outline">{row.category_name ?? "---"}</Badge>
        ),
      },
      {
        key: "budget",
        header: "Budget",
        align: "right" as const,
        sortable: true,
        render: (row: LedgerEntry) => (
          <EditableCell
            value={row.budget}
            onSave={handleBudgetSave(row)}
            formatDisplay={usdFormatter}
          />
        ),
      },
      {
        key: "actual",
        header: "Actual",
        align: "right" as const,
        sortable: true,
        render: (row: LedgerEntry) => (
          <EditableCell
            value={row.actual}
            onSave={handleActualSave(row)}
            formatDisplay={usdFormatter}
          />
        ),
      },
      {
        key: "variance",
        header: "Variance",
        align: "right" as const,
        sortable: true,
        render: (row: LedgerEntry) => {
          const variance = row.actual - row.budget;
          return varianceBadge(variance);
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center" as const,
        render: (row: LedgerEntry) => statusBadge(row.status),
      },
    ],
    [handleBudgetSave, handleActualSave]
  );

  /* ---- Budget vs Actual grouped bar chart data ---- */
  const barChartData = useMemo(() => {
    return entries.map((entry) => ({
      name: entry.account_name ?? entry.account_code ?? `#${entry.account_id}`,
      budget: num(entry.budget),
      actual: num(entry.actual),
    }));
  }, [entries]);

  /* ---- Running balance area chart data ---- */
  const runningBalanceData = useMemo(() => {
    let cumulativeBudget = 0;
    let cumulativeActual = 0;

    return entries.map((entry) => {
      const isRevenue = entry.category_type === "revenue";
      const budget = num(entry.budget);
      const actual = num(entry.actual);
      const budgetDelta = isRevenue ? budget : -budget;
      const actualDelta = isRevenue ? actual : -actual;

      cumulativeBudget += budgetDelta;
      cumulativeActual += actualDelta;

      return {
        name:
          entry.account_name ?? entry.account_code ?? `#${entry.account_id}`,
        budget_balance: cumulativeBudget,
        actual_balance: cumulativeActual,
      };
    });
  }, [entries]);

  /* ---- Variance summary stats ---- */
  const varianceSummary = useMemo(() => {
    const total = entries.reduce(
      (acc, e) => {
        acc.budget += num(e.budget);
        acc.actual += num(e.actual);
        return acc;
      },
      { budget: 0, actual: 0 }
    );

    return {
      totalBudget: total.budget,
      totalActual: total.actual,
      totalVariance: total.actual - total.budget,
      overBudgetCount: entries.filter((e) => e.actual > e.budget).length,
      underBudgetCount: entries.filter((e) => e.actual < e.budget).length,
    };
  }, [entries]);

  return (
    <PageContainer
      title="Cash Flow"
      description="Manage budget and actual cash flow"
    >
      {/* ---- Variance Summary Row ---- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(varianceSummary.totalBudget)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Actual</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(varianceSummary.totalActual)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Variance</p>
            <p
              className={cn(
                "text-xl font-bold",
                varianceSummary.totalVariance > 0
                  ? "text-destructive"
                  : varianceSummary.totalVariance < 0
                    ? "text-success"
                    : "text-foreground"
              )}
            >
              {varianceSummary.totalVariance >= 0 ? "+" : ""}
              {formatCurrency(varianceSummary.totalVariance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {varianceSummary.underBudgetCount} under budget
              {" / "}
              {varianceSummary.overBudgetCount} over budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Editable Ledger Table ---- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cash Flow Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={entries as (LedgerEntry & Record<string, unknown>)[]}
            loading={loading}
            emptyMessage="No cash flow data for this period"
          />
        </CardContent>
      </Card>

      {/* ---- Charts Row (2 side by side) ---- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Budget vs Actual Grouped Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="BarChart">
              {barChartData.length > 0 ? (
                <BarChartWidget
                  data={barChartData}
                  xKey="name"
                  bars={[
                    {
                      key: "budget",
                      name: "Budget",
                      color: CHART_COLORS.blue,
                    },
                    {
                      key: "actual",
                      name: "Actual",
                      color: CHART_COLORS.orange,
                    },
                  ]}
                  formatValue={usdFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Running Balance Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Running Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary name="AreaChart">
              {runningBalanceData.length > 0 ? (
                <AreaChartWidget
                  data={runningBalanceData}
                  xKey="name"
                  areas={[
                    {
                      key: "budget_balance",
                      name: "Budget Balance",
                      color: CHART_COLORS.blue,
                    },
                    {
                      key: "actual_balance",
                      name: "Actual Balance",
                      color: CHART_COLORS.green,
                    },
                  ]}
                  formatValue={usdFormatter}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
