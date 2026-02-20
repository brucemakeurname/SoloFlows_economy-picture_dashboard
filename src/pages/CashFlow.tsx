import { useContext, useMemo, useCallback } from "react";
import { FilterContext } from "@/App";
import PageContainer from "@/components/layout/PageContainer";
import DataTable from "@/components/dashboard/DataTable";
import EditableCell from "@/components/dashboard/EditableCell";
import BarChartWidget from "@/components/charts/BarChartWidget";
import AreaChartWidget from "@/components/charts/AreaChartWidget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLedger } from "@/hooks/useLedger";
import { cn, formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import type { LedgerEntry } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const vndFormatter = (v: number) => formatCurrency(v, "VND");

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
    forecast: { label: "Du bao", variant: "warning" },
    actual: { label: "Thuc te", variant: "success" },
    closed: { label: "Da dong", variant: "outline" },
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
        header: "Ma TK",
        sortable: true,
        render: (row: LedgerEntry) => (
          <span className="font-mono text-sm font-medium text-foreground">
            {row.account_code ?? "---"}
          </span>
        ),
      },
      {
        key: "account_name",
        header: "Ten tai khoan",
        sortable: true,
        render: (row: LedgerEntry) => (
          <span className="text-sm text-foreground">
            {row.account_name ?? "---"}
          </span>
        ),
      },
      {
        key: "category_name",
        header: "Loai",
        sortable: true,
        render: (row: LedgerEntry) => (
          <Badge variant="outline">{row.category_name ?? "---"}</Badge>
        ),
      },
      {
        key: "budget",
        header: "Ngan sach",
        align: "right" as const,
        sortable: true,
        render: (row: LedgerEntry) => (
          <EditableCell
            value={row.budget}
            onSave={handleBudgetSave(row)}
            formatDisplay={vndFormatter}
          />
        ),
      },
      {
        key: "actual",
        header: "Thuc te",
        align: "right" as const,
        sortable: true,
        render: (row: LedgerEntry) => (
          <EditableCell
            value={row.actual}
            onSave={handleActualSave(row)}
            formatDisplay={vndFormatter}
          />
        ),
      },
      {
        key: "variance",
        header: "Chenh lech",
        align: "right" as const,
        sortable: true,
        render: (row: LedgerEntry) => {
          const variance = row.actual - row.budget;
          return varianceBadge(variance);
        },
      },
      {
        key: "status",
        header: "Trang thai",
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
      budget: entry.budget,
      actual: entry.actual,
    }));
  }, [entries]);

  /* ---- Running balance area chart data ---- */
  const runningBalanceData = useMemo(() => {
    let cumulativeBudget = 0;
    let cumulativeActual = 0;

    return entries.map((entry) => {
      const isRevenue = entry.category_type === "revenue";
      const budgetDelta = isRevenue ? entry.budget : -entry.budget;
      const actualDelta = isRevenue ? entry.actual : -entry.actual;

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
        acc.budget += e.budget;
        acc.actual += e.actual;
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
      title="Dong tien"
      description="Quan ly ngan sach va dong tien thuc te"
    >
      {/* ---- Variance Summary Row ---- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tong ngan sach</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(varianceSummary.totalBudget)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tong thuc te</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(varianceSummary.totalActual)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tong chenh lech</p>
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
              {varianceSummary.underBudgetCount} duoi ngan sach
              {" / "}
              {varianceSummary.overBudgetCount} vuot ngan sach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Editable Ledger Table ---- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>So cai dong tien</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={entries as (LedgerEntry & Record<string, unknown>)[]}
            loading={loading}
            emptyMessage="Khong co du lieu dong tien cho ky nay"
          />
        </CardContent>
      </Card>

      {/* ---- Charts Row (2 side by side) ---- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Budget vs Actual Grouped Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ngan sach vs Thuc te</CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData.length > 0 ? (
              <BarChartWidget
                data={barChartData}
                xKey="name"
                bars={[
                  {
                    key: "budget",
                    name: "Ngan sach",
                    color: CHART_COLORS.blue,
                  },
                  {
                    key: "actual",
                    name: "Thuc te",
                    color: CHART_COLORS.orange,
                  },
                ]}
                formatValue={vndFormatter}
              />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                Khong co du lieu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Running Balance Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>So du luy ke</CardTitle>
          </CardHeader>
          <CardContent>
            {runningBalanceData.length > 0 ? (
              <AreaChartWidget
                data={runningBalanceData}
                xKey="name"
                areas={[
                  {
                    key: "budget_balance",
                    name: "So du ngan sach",
                    color: CHART_COLORS.blue,
                  },
                  {
                    key: "actual_balance",
                    name: "So du thuc te",
                    color: CHART_COLORS.green,
                  },
                ]}
                formatValue={vndFormatter}
              />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                Khong co du lieu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
