export interface Category {
  id: number;
  name: string;
  type: "revenue" | "cogs" | "opex" | "capex" | "cash";
  color: string | null;
  sort_order: number;
  created_at: string;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  category_id: number;
  subcategory: string | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
  category_name?: string;
  category_type?: Category["type"];
}

export interface LedgerEntry {
  id: number;
  account_id: number;
  period: string;
  budget: number;
  actual: number;
  variance: number;
  status: "forecast" | "actual" | "closed";
  notes: string | null;
  created_at: string;
  updated_at: string;
  account_name?: string;
  account_code?: string;
  category_name?: string;
  category_type?: Category["type"];
}

export interface KPIMetric {
  id: number;
  name: string;
  group_name: "finance" | "marketing" | "growth" | "product";
  unit: string;
  target_value: number | null;
  current_value: number;
  period: string;
  status: "on_track" | "warning" | "off_track";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Period {
  id: number;
  code: string;
  label: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface DataSource {
  id: number;
  name: string;
  type: "manual" | "api" | "webhook" | "database";
  endpoint: string | null;
  sync_interval_minutes: number | null;
  last_sync_at: string | null;
  status: "active" | "inactive" | "error";
  created_at: string;
}

export interface DashboardSummary {
  total_revenue: number;
  total_cogs: number;
  total_opex: number;
  total_capex: number;
  net_profit: number;
  burn_rate: number;
  available_cash: number;
  budget_revenue: number;
  budget_cogs: number;
  budget_opex: number;
  budget_capex: number;
  revenue_by_period: { period: string; amount: number }[];
  expense_by_period: { period: string; amount: number }[];
  expense_by_category: { name: string; amount: number; color: string }[];
  revenue_by_subcategory: { name: string; amount: number }[];
  monthly_trend: {
    period: string;
    revenue: number;
    cogs: number;
    opex: number;
    net: number;
  }[];
}

export interface FilterState {
  period: string;
  categories: string[];
  status: string;
}
