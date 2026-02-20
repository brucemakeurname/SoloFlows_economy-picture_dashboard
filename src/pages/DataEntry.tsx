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

const KPI_GROUP_OPTIONS = KPI_GROUPS.map((g) => {
  const labels: Record<string, string> = {
    finance: "Finance",
    marketing: "Marketing",
    growth: "Growth",
    product: "Product",
  };
  return { value: g, label: labels[g] };
});

export default function DataEntry() {
  const { filters } = useContext(FilterContext);

  // Fetch categories for account form
  const { data: categories } = useApi<Category[]>("categories.php", []);

  // Hooks for creating entries
  const { accounts, createAccount, refetch: refetchAccounts } = useAccounts();
  const { createEntry, refetch: refetchLedger } = useLedger(filters.period);
  const { createKPI, refetch: refetchKPI } = useKPI(filters.period);

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Category options for select
  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
  }, [categories]);

  // Account options for select
  const accountOptions = useMemo(() => {
    return accounts.map((a) => ({
      value: String(a.id),
      label: `${a.code} - ${a.name}`,
    }));
  }, [accounts]);

  // Ledger status options
  const ledgerStatusOptions = LEDGER_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  // Submit: Account
  const handleCreateAccount = useCallback(
    async (data: Record<string, string>) => {
      await createAccount({
        code: data.code,
        name: data.name,
        category_id: Number(data.category_id),
        subcategory: data.subcategory || null,
        notes: data.notes || null,
        status: "active",
        created_at: new Date().toISOString(),
      });
      refetchAccounts();
      showSuccess("Tai khoan da duoc tao thanh cong!");
    },
    [createAccount, refetchAccounts, showSuccess]
  );

  // Submit: Ledger
  const handleCreateLedger = useCallback(
    async (data: Record<string, string>) => {
      const budget = Number(data.budget) || 0;
      const actual = Number(data.actual) || 0;
      await createEntry({
        account_id: Number(data.account_id),
        period: data.period,
        budget,
        actual,
        variance: budget - actual,
        status: data.status as "forecast" | "actual" | "closed",
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      refetchLedger();
      showSuccess("But toan so cai da duoc tao thanh cong!");
    },
    [createEntry, refetchLedger, showSuccess]
  );

  // Submit: KPI
  const handleCreateKPI = useCallback(
    async (data: Record<string, string>) => {
      await createKPI({
        name: data.name,
        group_name: data.group_name as "finance" | "marketing" | "growth" | "product",
        unit: data.unit,
        target_value: data.target_value ? Number(data.target_value) : null,
        current_value: Number(data.current_value) || 0,
        period: data.period,
        status: (data.status as "on_track" | "warning" | "off_track") || "warning",
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      refetchKPI();
      showSuccess("Chi so KPI da duoc tao thanh cong!");
    },
    [createKPI, refetchKPI, showSuccess]
  );

  return (
    <PageContainer title="Nhap lieu" description="Them va chinh sua du lieu">
      <div className="space-y-6">
        {/* Success Toast */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <Tabs defaultValue="accounts">
          <TabsList>
            <TabsTrigger value="accounts">
              <Database className="mr-1.5 h-4 w-4" />
              Tai khoan
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <BookOpen className="mr-1.5 h-4 w-4" />
              So cai
            </TabsTrigger>
            <TabsTrigger value="kpi">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              KPI
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Tai khoan (Accounts) */}
          <TabsContent value="accounts">
            <DataEntryForm
              title="Tao tai khoan moi"
              fields={[
                {
                  name: "code",
                  label: "Ma tai khoan",
                  type: "text",
                  required: true,
                  placeholder: "VD: ACC-001",
                },
                {
                  name: "name",
                  label: "Ten tai khoan",
                  type: "text",
                  required: true,
                  placeholder: "VD: Chi phi van phong",
                },
                {
                  name: "category_id",
                  label: "Danh muc",
                  type: "select",
                  required: true,
                  options: categoryOptions,
                },
                {
                  name: "subcategory",
                  label: "Phan loai phu",
                  type: "text",
                  placeholder: "VD: Dien nuoc",
                },
                {
                  name: "notes",
                  label: "Ghi chu",
                  type: "textarea",
                  placeholder: "Ghi chu them ve tai khoan nay...",
                },
              ]}
              onSubmit={handleCreateAccount}
            />
          </TabsContent>

          {/* Tab 2: So cai (Ledger) */}
          <TabsContent value="ledger">
            <DataEntryForm
              title="Tao but toan so cai"
              fields={[
                {
                  name: "account_id",
                  label: "Tai khoan",
                  type: "select",
                  required: true,
                  options: accountOptions,
                },
                {
                  name: "period",
                  label: "Ky",
                  type: "text",
                  required: true,
                  placeholder: "2026-02",
                },
                {
                  name: "budget",
                  label: "Ngan sach",
                  type: "number",
                  placeholder: "0",
                },
                {
                  name: "actual",
                  label: "Thuc te",
                  type: "number",
                  placeholder: "0",
                },
                {
                  name: "status",
                  label: "Trang thai",
                  type: "select",
                  options: ledgerStatusOptions,
                },
                {
                  name: "notes",
                  label: "Ghi chu",
                  type: "textarea",
                  placeholder: "Ghi chu them...",
                },
              ]}
              onSubmit={handleCreateLedger}
            />
          </TabsContent>

          {/* Tab 3: KPI */}
          <TabsContent value="kpi">
            <DataEntryForm
              title="Tao chi so KPI"
              fields={[
                {
                  name: "name",
                  label: "Ten KPI",
                  type: "text",
                  required: true,
                  placeholder: "VD: Doanh thu thang",
                },
                {
                  name: "group_name",
                  label: "Nhom",
                  type: "select",
                  options: KPI_GROUP_OPTIONS,
                },
                {
                  name: "unit",
                  label: "Don vi",
                  type: "text",
                  placeholder: "VD: VND, %, users",
                },
                {
                  name: "target_value",
                  label: "Muc tieu",
                  type: "number",
                  placeholder: "0",
                },
                {
                  name: "current_value",
                  label: "Gia tri hien tai",
                  type: "number",
                  placeholder: "0",
                },
                {
                  name: "period",
                  label: "Ky",
                  type: "text",
                  placeholder: "2026-02",
                },
                {
                  name: "notes",
                  label: "Ghi chu",
                  type: "textarea",
                  placeholder: "Ghi chu them...",
                },
              ]}
              onSubmit={handleCreateKPI}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
