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

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const fmt = (v: number) => formatCurrency(v);

function statusBadge(status: LedgerEntry["status"]) {
  const config: Record<LedgerEntry["status"], { label: string; variant: "default" | "success" | "warning" | "outline" }> = {
    forecast: { label: "Forecast", variant: "warning" },
    actual: { label: "Actual", variant: "success" },
    closed: { label: "Closed", variant: "outline" },
  };
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export default function CashFlow() {
  const { filters } = useContext(FilterContext);
  const { entries, loading, updateEntry } = useLedger(filters.period);

  const handleBudgetSave = useCallback(
    (entry: LedgerEntry) => (newValue: number) => { updateEntry(entry.id, { budget: newValue }); },
    [updateEntry]
  );
  const handleActualSave = useCallback(
    (entry: LedgerEntry) => (newValue: number) => { updateEntry(entry.id, { actual: newValue }); },
    [updateEntry]
  );

  const columns = useMemo(() => [
    { key: "account_code", header: "Code", sortable: true, render: (row: LedgerEntry) => <span className="font-mono text-xs font-medium">{row.account_code ?? "---"}</span> },
    { key: "account_name", header: "Account", sortable: true, render: (row: LedgerEntry) => <span className="text-xs">{row.account_name ?? "---"}</span> },
    { key: "category_name", header: "Type", sortable: true, render: (row: LedgerEntry) => <Badge variant="outline">{row.category_name ?? "---"}</Badge> },
    { key: "budget", header: "Budget", align: "right" as const, sortable: true, render: (row: LedgerEntry) => <EditableCell value={row.budget} onSave={handleBudgetSave(row)} formatDisplay={fmt} /> },
    { key: "actual", header: "Actual", align: "right" as const, sortable: true, render: (row: LedgerEntry) => <EditableCell value={row.actual} onSave={handleActualSave(row)} formatDisplay={fmt} /> },
    { key: "variance", header: "Var", align: "right" as const, sortable: true, render: (row: LedgerEntry) => {
      const v = row.actual - row.budget;
      return <span className={cn("text-xs font-medium", v > 0 ? "text-destructive" : v < 0 ? "text-success" : "text-muted-foreground")}>{v >= 0 ? "+" : ""}{formatCurrency(v)}</span>;
    }},
    { key: "status", header: "Status", align: "center" as const, render: (row: LedgerEntry) => statusBadge(row.status) },
  ], [handleBudgetSave, handleActualSave]);

  const barChartData = useMemo(() => entries.map((e) => ({
    name: e.account_name ?? e.account_code ?? `#${e.account_id}`,
    budget: num(e.budget),
    actual: num(e.actual),
  })), [entries]);

  const runningBalanceData = useMemo(() => {
    let cb = 0, ca = 0;
    return entries.map((e) => {
      const isRev = e.category_type === "revenue";
      const b = num(e.budget), a = num(e.actual);
      cb += isRev ? b : -b;
      ca += isRev ? a : -a;
      return { name: e.account_name ?? e.account_code ?? `#${e.account_id}`, budget_balance: cb, actual_balance: ca };
    });
  }, [entries]);

  const vs = useMemo(() => {
    const t = entries.reduce((acc, e) => { acc.b += num(e.budget); acc.a += num(e.actual); return acc; }, { b: 0, a: 0 });
    return { budget: t.b, actual: t.a, variance: t.a - t.b, over: entries.filter((e) => e.actual > e.budget).length, under: entries.filter((e) => e.actual < e.budget).length };
  }, [entries]);

  return (
    <PageContainer title="Cash Flow" description="Budget and actual cash flow">
      {/* Inline summary stats */}
      <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-2 text-sm">
        <div><span className="text-muted-foreground">Budget: </span><span className="font-semibold">{formatCurrency(vs.budget)}</span></div>
        <div><span className="text-muted-foreground">Actual: </span><span className="font-semibold">{formatCurrency(vs.actual)}</span></div>
        <div>
          <span className="text-muted-foreground">Variance: </span>
          <span className={cn("font-semibold", vs.variance > 0 ? "text-destructive" : vs.variance < 0 ? "text-success" : "")}>
            {vs.variance >= 0 ? "+" : ""}{formatCurrency(vs.variance)}
          </span>
          <span className="ml-1.5 text-xs text-muted-foreground">({vs.under} under / {vs.over} over)</span>
        </div>
      </div>

      {/* Main layout: table left, charts right */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {/* Table — spans 2 cols on xl */}
        <Card className="xl:col-span-2">
          <CardHeader className="px-3 py-2">
            <CardTitle className="text-sm">Cash Flow Ledger</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <div className="max-h-[400px] overflow-auto">
              <DataTable
                columns={columns}
                data={entries as (LedgerEntry & Record<string, unknown>)[]}
                loading={loading}
                emptyMessage="No cash flow data for this period"
              />
            </div>
          </CardContent>
        </Card>

        {/* Charts stacked vertically on right */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="text-sm">Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-0">
              <ErrorBoundary name="BarChart">
                {barChartData.length > 0 ? (
                  <BarChartWidget
                    data={barChartData}
                    xKey="name"
                    bars={[
                      { key: "budget", name: "Budget", color: CHART_COLORS.blue },
                      { key: "actual", name: "Actual", color: CHART_COLORS.orange },
                    ]}
                    height={180}
                    formatValue={fmt}
                  />
                ) : (
                  <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">No data</div>
                )}
              </ErrorBoundary>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="text-sm">Running Balance</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-0">
              <ErrorBoundary name="AreaChart">
                {runningBalanceData.length > 0 ? (
                  <AreaChartWidget
                    data={runningBalanceData}
                    xKey="name"
                    areas={[
                      { key: "budget_balance", name: "Budget", color: CHART_COLORS.blue },
                      { key: "actual_balance", name: "Actual", color: CHART_COLORS.green },
                    ]}
                    height={180}
                    formatValue={fmt}
                  />
                ) : (
                  <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">No data</div>
                )}
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
