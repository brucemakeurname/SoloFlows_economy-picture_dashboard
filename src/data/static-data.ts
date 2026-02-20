/**
 * Static financial data for Economy Picture Dashboard.
 * Replace with live API calls when real-time tracking is ready.
 *
 * NOTE — White screen root cause (for when we re-enable live API):
 * MySQL DECIMAL columns are returned as STRINGS through PHP PDO
 * (e.g. "350.00" not 350). Recharts crashes with
 * `TypeError: (f ?? []).map is not a function` when it receives
 * string values where numbers are expected.
 *
 * FIX NEEDED in PHP API before re-enabling:
 * - ledger.php: cast budget/actual/variance to (float) in array_map
 * - kpi.php: cast target_value/current_value to (float) in array_map
 * - summary.php: ensure all numeric fields are cast to (float)
 * These casts were already added in commits 69b1c4d..d38365d but
 * verify they're still present after any API changes.
 */
import type {
  DashboardSummary,
  LedgerEntry,
  KPIMetric,
  Category,
  Account,
  Period,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */
export const CATEGORIES: Category[] = [
  { id: 1, name: "Doanh thu", type: "revenue", color: "#10B981", sort_order: 1, created_at: "2026-02-20" },
  { id: 2, name: "Gia von - COGS", type: "cogs", color: "#F59E0B", sort_order: 2, created_at: "2026-02-20" },
  { id: 3, name: "Chi phi van hanh - OpEx", type: "opex", color: "#EF4444", sort_order: 3, created_at: "2026-02-20" },
];

/* ------------------------------------------------------------------ */
/*  Accounts                                                           */
/* ------------------------------------------------------------------ */
export const ACCOUNTS: Account[] = [
  { id: 1, code: "REV-001", name: "Dat lich Influencer AI", category_id: 1, subcategory: "Booking", status: "active", notes: null, created_at: "2026-02-20", category_name: "Doanh thu", category_type: "revenue" },
  { id: 2, code: "REV-002", name: "Ban credit AI", category_id: 1, subcategory: "Credits", status: "active", notes: null, created_at: "2026-02-20", category_name: "Doanh thu", category_type: "revenue" },
  { id: 3, code: "REV-003", name: "Affiliate IG/TikTok/Shopee", category_id: 1, subcategory: "Affiliate", status: "active", notes: null, created_at: "2026-02-20", category_name: "Doanh thu", category_type: "revenue" },
  { id: 4, code: "REV-004", name: "Tai tro thuong hieu", category_id: 1, subcategory: "Sponsored", status: "active", notes: null, created_at: "2026-02-20", category_name: "Doanh thu", category_type: "revenue" },
  { id: 5, code: "COG-001", name: "Google Cloud / Vertex AI", category_id: 2, subcategory: "Cloud", status: "active", notes: null, created_at: "2026-02-20", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 6, code: "COG-002", name: "API AI ben thu ba", category_id: 2, subcategory: "Cloud", status: "active", notes: null, created_at: "2026-02-20", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 7, code: "COG-003", name: "Cloudflare R2 Storage", category_id: 2, subcategory: "Storage", status: "active", notes: null, created_at: "2026-02-20", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 8, code: "OPX-001", name: "Vercel Hosting", category_id: 3, subcategory: "Hosting", status: "active", notes: null, created_at: "2026-02-20", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 9, code: "OPX-002", name: "Domain va DNS", category_id: 3, subcategory: "Hosting", status: "active", notes: null, created_at: "2026-02-20", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 10, code: "OPX-003", name: "Supabase", category_id: 3, subcategory: "Database", status: "active", notes: null, created_at: "2026-02-20", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
];

/* ------------------------------------------------------------------ */
/*  Periods                                                            */
/* ------------------------------------------------------------------ */
export const PERIODS: Period[] = [
  { id: 1, code: "2026-02", label: "Thang 2/2026", start_date: "2026-02-01", end_date: "2026-02-28", is_active: true, created_at: "2026-02-20" },
  { id: 2, code: "2026-03", label: "Thang 3/2026", start_date: "2026-03-01", end_date: "2026-03-31", is_active: false, created_at: "2026-02-20" },
  { id: 3, code: "2026-04", label: "Thang 4/2026", start_date: "2026-04-01", end_date: "2026-04-30", is_active: false, created_at: "2026-02-20" },
];

/* ------------------------------------------------------------------ */
/*  Ledger Entries                                                     */
/* ------------------------------------------------------------------ */
export const LEDGER_ENTRIES: LedgerEntry[] = [
  // 2026-02 (actual)
  { id: 1, account_id: 1, period: "2026-02", budget: 100, actual: 45, variance: -55, status: "actual", notes: "Booking dau tien - con it khach", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Dat lich Influencer AI", account_code: "REV-001", category_name: "Doanh thu", category_type: "revenue" },
  { id: 2, account_id: 2, period: "2026-02", budget: 150, actual: 80, variance: -70, status: "actual", notes: "Ban credit dang tang dan", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Ban credit AI", account_code: "REV-002", category_name: "Doanh thu", category_type: "revenue" },
  { id: 3, account_id: 3, period: "2026-02", budget: 50, actual: 12, variance: -38, status: "actual", notes: "Affiliate moi bat dau", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Affiliate IG/TikTok/Shopee", account_code: "REV-003", category_name: "Doanh thu", category_type: "revenue" },
  { id: 4, account_id: 4, period: "2026-02", budget: 200, actual: 0, variance: -200, status: "actual", notes: "Chua co brand deal", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Tai tro thuong hieu", account_code: "REV-004", category_name: "Doanh thu", category_type: "revenue" },
  { id: 5, account_id: 5, period: "2026-02", budget: 80, actual: 65, variance: -15, status: "actual", notes: "Google Cloud API", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Google Cloud / Vertex AI", account_code: "COG-001", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 6, account_id: 6, period: "2026-02", budget: 40, actual: 35, variance: -5, status: "actual", notes: "API calls vua phai", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "API AI ben thu ba", account_code: "COG-002", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 7, account_id: 7, period: "2026-02", budget: 10, actual: 5, variance: -5, status: "actual", notes: "Storage con it", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Cloudflare R2 Storage", account_code: "COG-003", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 8, account_id: 8, period: "2026-02", budget: 20, actual: 20, variance: 0, status: "actual", notes: "Vercel Pro plan", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Vercel Hosting", account_code: "OPX-001", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 9, account_id: 9, period: "2026-02", budget: 15, actual: 12, variance: -3, status: "actual", notes: "Domain renewal", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Domain va DNS", account_code: "OPX-002", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 10, account_id: 10, period: "2026-02", budget: 25, actual: 25, variance: 0, status: "actual", notes: "Supabase Pro plan", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Supabase", account_code: "OPX-003", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  // 2026-03 (forecast)
  { id: 11, account_id: 1, period: "2026-03", budget: 200, actual: 0, variance: -200, status: "forecast", notes: "Tang gap doi tu marketing", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Dat lich Influencer AI", account_code: "REV-001", category_name: "Doanh thu", category_type: "revenue" },
  { id: 12, account_id: 2, period: "2026-03", budget: 250, actual: 0, variance: -250, status: "forecast", notes: "Credit sales tang", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Ban credit AI", account_code: "REV-002", category_name: "Doanh thu", category_type: "revenue" },
  { id: 13, account_id: 3, period: "2026-03", budget: 100, actual: 0, variance: -100, status: "forecast", notes: "Affiliate traction", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Affiliate IG/TikTok/Shopee", account_code: "REV-003", category_name: "Doanh thu", category_type: "revenue" },
  { id: 14, account_id: 4, period: "2026-03", budget: 300, actual: 0, variance: -300, status: "forecast", notes: "1 brand deal nho", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Tai tro thuong hieu", account_code: "REV-004", category_name: "Doanh thu", category_type: "revenue" },
  { id: 15, account_id: 5, period: "2026-03", budget: 120, actual: 0, variance: -120, status: "forecast", notes: "Tang theo usage", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Google Cloud / Vertex AI", account_code: "COG-001", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 16, account_id: 6, period: "2026-03", budget: 60, actual: 0, variance: -60, status: "forecast", notes: "Them AI adapter", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "API AI ben thu ba", account_code: "COG-002", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 17, account_id: 7, period: "2026-03", budget: 15, actual: 0, variance: -15, status: "forecast", notes: "Storage tang", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Cloudflare R2 Storage", account_code: "COG-003", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 18, account_id: 8, period: "2026-03", budget: 20, actual: 0, variance: -20, status: "forecast", notes: "Vercel Pro", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Vercel Hosting", account_code: "OPX-001", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 19, account_id: 9, period: "2026-03", budget: 15, actual: 0, variance: -15, status: "forecast", notes: "Domain/DNS", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Domain va DNS", account_code: "OPX-002", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 20, account_id: 10, period: "2026-03", budget: 25, actual: 0, variance: -25, status: "forecast", notes: "Supabase Pro", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Supabase", account_code: "OPX-003", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  // 2026-04 (forecast)
  { id: 21, account_id: 1, period: "2026-04", budget: 350, actual: 0, variance: -350, status: "forecast", notes: "Growth tu IG", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Dat lich Influencer AI", account_code: "REV-001", category_name: "Doanh thu", category_type: "revenue" },
  { id: 22, account_id: 2, period: "2026-04", budget: 400, actual: 0, variance: -400, status: "forecast", notes: "Credit demand tang", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Ban credit AI", account_code: "REV-002", category_name: "Doanh thu", category_type: "revenue" },
  { id: 23, account_id: 3, period: "2026-04", budget: 150, actual: 0, variance: -150, status: "forecast", notes: "Affiliate matured", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Affiliate IG/TikTok/Shopee", account_code: "REV-003", category_name: "Doanh thu", category_type: "revenue" },
  { id: 24, account_id: 4, period: "2026-04", budget: 500, actual: 0, variance: -500, status: "forecast", notes: "Brand deal lon", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Tai tro thuong hieu", account_code: "REV-004", category_name: "Doanh thu", category_type: "revenue" },
  { id: 25, account_id: 5, period: "2026-04", budget: 180, actual: 0, variance: -180, status: "forecast", notes: "Scale AI infra", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Google Cloud / Vertex AI", account_code: "COG-001", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 26, account_id: 6, period: "2026-04", budget: 80, actual: 0, variance: -80, status: "forecast", notes: "More API volume", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "API AI ben thu ba", account_code: "COG-002", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 27, account_id: 7, period: "2026-04", budget: 25, actual: 0, variance: -25, status: "forecast", notes: "Media growing", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Cloudflare R2 Storage", account_code: "COG-003", category_name: "Gia von - COGS", category_type: "cogs" },
  { id: 28, account_id: 8, period: "2026-04", budget: 20, actual: 0, variance: -20, status: "forecast", notes: "Vercel Pro", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Vercel Hosting", account_code: "OPX-001", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 29, account_id: 9, period: "2026-04", budget: 15, actual: 0, variance: -15, status: "forecast", notes: "Domain/DNS", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Domain va DNS", account_code: "OPX-002", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
  { id: 30, account_id: 10, period: "2026-04", budget: 25, actual: 0, variance: -25, status: "forecast", notes: "Supabase Pro", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Supabase", account_code: "OPX-003", category_name: "Chi phi van hanh - OpEx", category_type: "opex" },
];

/* ------------------------------------------------------------------ */
/*  KPI Metrics                                                        */
/* ------------------------------------------------------------------ */
export const KPI_METRICS: KPIMetric[] = [
  { id: 1, name: "Doanh thu thang", group_name: "finance", unit: "USD", target_value: 500, current_value: 137, period: "2026-02", status: "off_track", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 2, name: "Ty suat loi nhuan", group_name: "finance", unit: "%", target_value: 30, current_value: -18.2, period: "2026-02", status: "off_track", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 3, name: "Burn Rate", group_name: "finance", unit: "USD/thang", target_value: 150, current_value: 162, period: "2026-02", status: "warning", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 4, name: "IG Followers", group_name: "marketing", unit: "followers", target_value: 5000, current_value: 1200, period: "2026-02", status: "warning", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 5, name: "IG Engagement Rate", group_name: "marketing", unit: "%", target_value: 5, current_value: 3.8, period: "2026-02", status: "warning", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 6, name: "Website Traffic", group_name: "marketing", unit: "visits/thang", target_value: 2000, current_value: 450, period: "2026-02", status: "off_track", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 7, name: "User Signups", group_name: "growth", unit: "users", target_value: 100, current_value: 28, period: "2026-02", status: "off_track", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 8, name: "Conversion Rate", group_name: "growth", unit: "%", target_value: 8, current_value: 6.2, period: "2026-02", status: "warning", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 9, name: "Platform Uptime", group_name: "product", unit: "%", target_value: 99.9, current_value: 99.95, period: "2026-02", status: "on_track", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 10, name: "AI Generation Speed", group_name: "product", unit: "sec", target_value: 10, current_value: 8.5, period: "2026-02", status: "on_track", notes: null, created_at: "2026-02-20", updated_at: "2026-02-20" },
];

/* ------------------------------------------------------------------ */
/*  Dashboard Summary (computed from ledger)                           */
/* ------------------------------------------------------------------ */
export function computeSummary(period?: string): DashboardSummary {
  const periods = ["2026-02", "2026-03", "2026-04"];
  const filterEntries = period && period !== "all"
    ? LEDGER_ENTRIES.filter((e) => e.period === period)
    : LEDGER_ENTRIES;

  const rev = filterEntries.filter((e) => e.category_type === "revenue");
  const cogs = filterEntries.filter((e) => e.category_type === "cogs");
  const opex = filterEntries.filter((e) => e.category_type === "opex");

  const totalRevenue = rev.reduce((s, e) => s + e.actual, 0);
  const totalCogs = cogs.reduce((s, e) => s + e.actual, 0);
  const totalOpex = opex.reduce((s, e) => s + e.actual, 0);
  const netProfit = totalRevenue - totalCogs - totalOpex;
  const burnRate = totalCogs + totalOpex;

  const budgetRevenue = rev.reduce((s, e) => s + e.budget, 0);
  const budgetCogs = cogs.reduce((s, e) => s + e.budget, 0);
  const budgetOpex = opex.reduce((s, e) => s + e.budget, 0);

  const revenueByPeriod = periods.map((p) => ({
    period: p,
    amount: LEDGER_ENTRIES.filter((e) => e.period === p && e.category_type === "revenue").reduce((s, e) => s + e.actual, 0),
  }));

  const expenseByPeriod = periods.map((p) => ({
    period: p,
    amount: LEDGER_ENTRIES.filter((e) => e.period === p && (e.category_type === "cogs" || e.category_type === "opex")).reduce((s, e) => s + e.actual, 0),
  }));

  const expenseByCategory = [
    { name: "Gia von - COGS", amount: totalCogs, color: "#F59E0B" },
    { name: "Chi phi van hanh - OpEx", amount: totalOpex, color: "#EF4444" },
  ];

  const subcategories = ["Credits", "Booking", "Affiliate", "Sponsored"];
  const revenueBySubcategory = subcategories.map((sub) => ({
    name: sub,
    amount: filterEntries.filter((e) => e.category_type === "revenue" && ACCOUNTS.find((a) => a.id === e.account_id)?.subcategory === sub).reduce((s, e) => s + e.actual, 0),
  }));

  const monthlyTrend = periods.map((p) => {
    const pEntries = LEDGER_ENTRIES.filter((e) => e.period === p);
    const r = pEntries.filter((e) => e.category_type === "revenue").reduce((s, e) => s + e.actual, 0);
    const c = pEntries.filter((e) => e.category_type === "cogs").reduce((s, e) => s + e.actual, 0);
    const o = pEntries.filter((e) => e.category_type === "opex").reduce((s, e) => s + e.actual, 0);
    return { period: p, revenue: r, cogs: c, opex: o, net: r - c - o };
  });

  return {
    total_revenue: totalRevenue,
    total_cogs: totalCogs,
    total_opex: totalOpex,
    total_capex: 0,
    net_profit: netProfit,
    burn_rate: burnRate,
    revenue_by_period: revenueByPeriod,
    expense_by_period: expenseByPeriod,
    expense_by_category: expenseByCategory,
    revenue_by_subcategory: revenueBySubcategory,
    monthly_trend: monthlyTrend,
    budget_revenue: budgetRevenue,
    budget_cogs: budgetCogs,
    budget_opex: budgetOpex,
    budget_capex: 0,
  };
}
