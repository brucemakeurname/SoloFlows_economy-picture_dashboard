import { useContext, useMemo, useState, useCallback } from "react";
import { Database, BookOpen, BarChart3, CheckCircle2 } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import DataEntryForm from "@/components/dashboard/DataEntryForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useApi } from "@/hooks/useApi";
import { useAccounts } from "@/hooks/useAccounts";
import { useLedger } from "@/hooks/useLedger";
import { useKPI } from "@/hooks/useKPI";
import { KPI_GROUPS, LEDGER_STATUS_OPTIONS } from "@/lib/constants";
import { FilterContext } from "@/App";
import type { Category } from "@/lib/types";

const KPI_GROUP_OPTIONS = KPI_GROUPS.map((g) => ({
  value: g,
  label: { finance: "Finance", marketing: "Marketing", growth: "Growth", product: "Product" }[g],
}));

export default function DataEntry() {
  const { filters } = useContext(FilterContext);
  const { data: categories } = useApi<Category[]>("categories.php", []);
  const { accounts, createAccount, refetch: refetchAccounts } = useAccounts();
  const { createEntry, refetch: refetchLedger } = useLedger(filters.period);
  const { createKPI, refetch: refetchKPI } = useKPI(filters.period);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const categoryOptions = useMemo(() => (categories ?? []).map((c) => ({ value: String(c.id), label: c.name })), [categories]);
  const accountOptions = useMemo(() => accounts.map((a) => ({ value: String(a.id), label: `${a.code} - ${a.name}` })), [accounts]);
  const ledgerStatusOptions = LEDGER_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }));

  const handleCreateAccount = useCallback(async (data: Record<string, string>) => {
    await createAccount({ code: data.code, name: data.name, category_id: Number(data.category_id), subcategory: data.subcategory || null, notes: data.notes || null, status: "active", created_at: new Date().toISOString() });
    refetchAccounts();
    showSuccess("Account created successfully!");
  }, [createAccount, refetchAccounts, showSuccess]);

  const handleCreateLedger = useCallback(async (data: Record<string, string>) => {
    const budget = Number(data.budget) || 0;
    const actual = Number(data.actual) || 0;
    await createEntry({ account_id: Number(data.account_id), period: data.period, budget, actual, variance: budget - actual, status: data.status as "forecast" | "actual" | "closed", notes: data.notes || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    refetchLedger();
    showSuccess("Ledger entry created successfully!");
  }, [createEntry, refetchLedger, showSuccess]);

  const handleCreateKPI = useCallback(async (data: Record<string, string>) => {
    await createKPI({ name: data.name, group_name: data.group_name as "finance" | "marketing" | "growth" | "product", unit: data.unit, target_value: data.target_value ? Number(data.target_value) : null, current_value: Number(data.current_value) || 0, period: data.period, status: (data.status as "on_track" | "warning" | "off_track") || "warning", notes: data.notes || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    refetchKPI();
    showSuccess("KPI metric created successfully!");
  }, [createKPI, refetchKPI, showSuccess]);

  return (
    <PageContainer title="Data Entry" description="Add and edit data">
      {successMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" /><span>{successMessage}</span>
        </div>
      )}

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts"><Database className="mr-1 h-3.5 w-3.5" />Accounts</TabsTrigger>
          <TabsTrigger value="ledger"><BookOpen className="mr-1 h-3.5 w-3.5" />Ledger</TabsTrigger>
          <TabsTrigger value="kpi"><BarChart3 className="mr-1 h-3.5 w-3.5" />KPI</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <DataEntryForm
            title="Create New Account"
            fields={[
              { name: "code", label: "Account Code", type: "text", required: true, placeholder: "e.g. ACC-001" },
              { name: "name", label: "Account Name", type: "text", required: true, placeholder: "e.g. Office Expenses" },
              { name: "category_id", label: "Category", type: "select", required: true, options: categoryOptions },
              { name: "subcategory", label: "Subcategory", type: "text", placeholder: "e.g. Utilities" },
              { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
            ]}
            onSubmit={handleCreateAccount}
          />
        </TabsContent>

        <TabsContent value="ledger">
          <DataEntryForm
            title="Create Ledger Entry"
            fields={[
              { name: "account_id", label: "Account", type: "select", required: true, options: accountOptions },
              { name: "period", label: "Period", type: "text", required: true, placeholder: "2026-02" },
              { name: "budget", label: "Budget", type: "number", placeholder: "0" },
              { name: "actual", label: "Actual", type: "number", placeholder: "0" },
              { name: "status", label: "Status", type: "select", options: ledgerStatusOptions },
              { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
            ]}
            onSubmit={handleCreateLedger}
          />
        </TabsContent>

        <TabsContent value="kpi">
          <DataEntryForm
            title="Create KPI Metric"
            fields={[
              { name: "name", label: "KPI Name", type: "text", required: true, placeholder: "e.g. Monthly Revenue" },
              { name: "group_name", label: "Group", type: "select", options: KPI_GROUP_OPTIONS },
              { name: "unit", label: "Unit", type: "text", placeholder: "e.g. USD, %, users" },
              { name: "target_value", label: "Target", type: "number", placeholder: "0" },
              { name: "current_value", label: "Current Value", type: "number", placeholder: "0" },
              { name: "period", label: "Period", type: "text", placeholder: "2026-02" },
              { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
            ]}
            onSubmit={handleCreateKPI}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
