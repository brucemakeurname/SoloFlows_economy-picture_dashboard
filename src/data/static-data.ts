/**
 * Static financial data for Economy Picture Dashboard.
 * Aligned with Notion H-segment (18 accounts, Sprint 2 plan).
 *
 * Sprint 2: Feb 20 – Apr 20, 2026
 * Stage 1 (2 weeks): Platform + Legal + AI Agents
 * Stage 2 (6 weeks): Mass content + First revenue (10→50 bookings)
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
  { id: 1, name: "Revenue", type: "revenue", color: "#10B981", sort_order: 1, created_at: "2026-02-20" },
  { id: 2, name: "Cost of Goods Sold", type: "cogs", color: "#F59E0B", sort_order: 2, created_at: "2026-02-20" },
  { id: 3, name: "Operating Expenses", type: "opex", color: "#EF4444", sort_order: 3, created_at: "2026-02-20" },
];

/* ------------------------------------------------------------------ */
/*  Accounts (18 — matches Notion CoA 1100-3800)                      */
/* ------------------------------------------------------------------ */
export const ACCOUNTS: Account[] = [
  // Revenue (1xxx)
  { id: 1, code: "1100", name: "AI Influencer Booking", category_id: 1, subcategory: "Booking", status: "active", notes: null, created_at: "2026-02-20", category_name: "Revenue", category_type: "revenue" },
  { id: 2, code: "1200", name: "Affiliate (Shopee/TikTok/IG)", category_id: 1, subcategory: "Affiliate", status: "active", notes: null, created_at: "2026-02-20", category_name: "Revenue", category_type: "revenue" },
  { id: 3, code: "1300", name: "Credit Top-up", category_id: 1, subcategory: "Credits", status: "active", notes: null, created_at: "2026-02-20", category_name: "Revenue", category_type: "revenue" },
  { id: 4, code: "1400", name: "VIP Subscription", category_id: 1, subcategory: "VIP", status: "active", notes: null, created_at: "2026-02-20", category_name: "Revenue", category_type: "revenue" },
  // COGS (2xxx)
  { id: 5, code: "2100", name: "Google AI (Imagen/Veo)", category_id: 2, subcategory: "AI API", status: "active", notes: null, created_at: "2026-02-20", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 6, code: "2200", name: "Grok API (xAI)", category_id: 2, subcategory: "AI API", status: "active", notes: null, created_at: "2026-02-20", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 7, code: "2300", name: "Kling API", category_id: 2, subcategory: "AI API", status: "active", notes: null, created_at: "2026-02-20", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 8, code: "2400", name: "MidJourney API", category_id: 2, subcategory: "AI API", status: "active", notes: null, created_at: "2026-02-20", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 9, code: "2510", name: "Sepay Fee (2% VND)", category_id: 2, subcategory: "Payment Gateway", status: "active", notes: null, created_at: "2026-02-20", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 10, code: "2520", name: "PayPal Fee (3.49% USD)", category_id: 2, subcategory: "Payment Gateway", status: "active", notes: null, created_at: "2026-02-20", category_name: "Cost of Goods Sold", category_type: "cogs" },
  // OpEx (3xxx)
  { id: 11, code: "3100", name: "Vercel Pro", category_id: 3, subcategory: "Infrastructure", status: "active", notes: null, created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 12, code: "3200", name: "Supabase (Free Tier)", category_id: 3, subcategory: "Infrastructure", status: "active", notes: null, created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 13, code: "3300", name: "Cloudflare R2", category_id: 3, subcategory: "Infrastructure", status: "active", notes: null, created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 14, code: "3400", name: "Domain (aitemplate.co)", category_id: 3, subcategory: "Infrastructure", status: "active", notes: null, created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 15, code: "3500", name: "IG Ads (Vey + Bruce)", category_id: 3, subcategory: "Marketing", status: "active", notes: null, created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 16, code: "3600", name: "Legal — Business Registration", category_id: 3, subcategory: "Legal", status: "active", notes: "One-time: stamp, sign, digital sig, e-invoice, tax", created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 17, code: "3700", name: "Content Tools (Veo3 + Kling)", category_id: 3, subcategory: "Content", status: "active", notes: "Veo3 ~$3.60/mo + Kling ~$5-10/pack", created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
  { id: 18, code: "3800", name: "Accounting Service", category_id: 3, subcategory: "Accounting", status: "active", notes: "Monthly if hired: $20-60", created_at: "2026-02-20", category_name: "Operating Expenses", category_type: "opex" },
];

/* ------------------------------------------------------------------ */
/*  Periods                                                            */
/* ------------------------------------------------------------------ */
export const PERIODS: Period[] = [
  { id: 1, code: "2026-02", label: "Feb 2026", start_date: "2026-02-01", end_date: "2026-02-28", is_active: true, created_at: "2026-02-20" },
  { id: 2, code: "2026-03", label: "Mar 2026", start_date: "2026-03-01", end_date: "2026-03-31", is_active: false, created_at: "2026-02-20" },
  { id: 3, code: "2026-04", label: "Apr 2026", start_date: "2026-04-01", end_date: "2026-04-30", is_active: false, created_at: "2026-02-20" },
];

/* ------------------------------------------------------------------ */
/*  Ledger Entries (18 accounts × 3 months = 54 entries)               */
/* ------------------------------------------------------------------ */
export const LEDGER_ENTRIES: LedgerEntry[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 2026-02 (Feb — Setup month, Vercel + Legal only)
  // ═══════════════════════════════════════════════════════════════════
  // Revenue
  { id: 1, account_id: 1, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Platform not live for bookings yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "AI Influencer Booking", account_code: "1100", category_name: "Revenue", category_type: "revenue" },
  { id: 2, account_id: 2, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Affiliate not started", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Affiliate (Shopee/TikTok/IG)", account_code: "1200", category_name: "Revenue", category_type: "revenue" },
  { id: 3, account_id: 3, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "No credit purchases yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Credit Top-up", account_code: "1300", category_name: "Revenue", category_type: "revenue" },
  { id: 4, account_id: 4, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "VIP not launched", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "VIP Subscription", account_code: "1400", category_name: "Revenue", category_type: "revenue" },
  // COGS
  { id: 5, account_id: 5, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Google AI (Imagen/Veo)", account_code: "2100", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 6, account_id: 6, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Grok API (xAI)", account_code: "2200", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 7, account_id: 7, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Kling API", account_code: "2300", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 8, account_id: 8, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "MidJourney API", account_code: "2400", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 9, account_id: 9, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "No transactions yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Sepay Fee (2% VND)", account_code: "2510", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 10, account_id: 10, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "No transactions yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "PayPal Fee (3.49% USD)", account_code: "2520", category_name: "Cost of Goods Sold", category_type: "cogs" },
  // OpEx
  { id: 11, account_id: 11, period: "2026-02", budget: 20, actual: 20, variance: 0, status: "actual", notes: "Vercel Pro plan", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Vercel Pro", account_code: "3100", category_name: "Operating Expenses", category_type: "opex" },
  { id: 12, account_id: 12, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Free tier", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Supabase (Free Tier)", account_code: "3200", category_name: "Operating Expenses", category_type: "opex" },
  { id: 13, account_id: 13, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Minimal storage", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Cloudflare R2", account_code: "3300", category_name: "Operating Expenses", category_type: "opex" },
  { id: 14, account_id: 14, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Already paid", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Domain (aitemplate.co)", account_code: "3400", category_name: "Operating Expenses", category_type: "opex" },
  { id: 15, account_id: 15, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Organic only for now", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "IG Ads (Vey + Bruce)", account_code: "3500", category_name: "Operating Expenses", category_type: "opex" },
  { id: 16, account_id: 16, period: "2026-02", budget: 20, actual: 0, variance: -20, status: "actual", notes: "Company stamp $15 + sign $5", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Legal — Business Registration", account_code: "3600", category_name: "Operating Expenses", category_type: "opex" },
  { id: 17, account_id: 17, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Not started yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Content Tools (Veo3 + Kling)", account_code: "3700", category_name: "Operating Expenses", category_type: "opex" },
  { id: 18, account_id: 18, period: "2026-02", budget: 0, actual: 0, variance: 0, status: "actual", notes: "Not hired yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Accounting Service", account_code: "3800", category_name: "Operating Expenses", category_type: "opex" },

  // ═══════════════════════════════════════════════════════════════════
  // 2026-03 (Mar — Stage 1 ends, Stage 2 starts, 10 bookings)
  // ═══════════════════════════════════════════════════════════════════
  // Revenue
  { id: 19, account_id: 1, period: "2026-03", budget: 30, actual: 0, variance: -30, status: "forecast", notes: "10 bookings × 300 CR ($3 each)", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "AI Influencer Booking", account_code: "1100", category_name: "Revenue", category_type: "revenue" },
  { id: 20, account_id: 2, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Not active yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Affiliate (Shopee/TikTok/IG)", account_code: "1200", category_name: "Revenue", category_type: "revenue" },
  { id: 21, account_id: 3, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Tracked via bookings", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Credit Top-up", account_code: "1300", category_name: "Revenue", category_type: "revenue" },
  { id: 22, account_id: 4, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "VIP not launched yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "VIP Subscription", account_code: "1400", category_name: "Revenue", category_type: "revenue" },
  // COGS
  { id: 23, account_id: 5, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Google AI (Imagen/Veo)", account_code: "2100", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 24, account_id: 6, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Grok API (xAI)", account_code: "2200", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 25, account_id: 7, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Kling API", account_code: "2300", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 26, account_id: 8, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "MidJourney API", account_code: "2400", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 27, account_id: 9, period: "2026-03", budget: 1, actual: 0, variance: -1, status: "forecast", notes: "2% fee on ~$30 VND bookings", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Sepay Fee (2% VND)", account_code: "2510", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 28, account_id: 10, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "No USD transactions expected", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "PayPal Fee (3.49% USD)", account_code: "2520", category_name: "Cost of Goods Sold", category_type: "cogs" },
  // OpEx
  { id: 29, account_id: 11, period: "2026-03", budget: 20, actual: 0, variance: -20, status: "forecast", notes: "Vercel Pro plan", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Vercel Pro", account_code: "3100", category_name: "Operating Expenses", category_type: "opex" },
  { id: 30, account_id: 12, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free tier", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Supabase (Free Tier)", account_code: "3200", category_name: "Operating Expenses", category_type: "opex" },
  { id: 31, account_id: 13, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Minimal", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Cloudflare R2", account_code: "3300", category_name: "Operating Expenses", category_type: "opex" },
  { id: 32, account_id: 14, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Already paid", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Domain (aitemplate.co)", account_code: "3400", category_name: "Operating Expenses", category_type: "opex" },
  { id: 33, account_id: 15, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Organic growth only", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "IG Ads (Vey + Bruce)", account_code: "3500", category_name: "Operating Expenses", category_type: "opex" },
  { id: 34, account_id: 16, period: "2026-03", budget: 130, actual: 0, variance: -130, status: "forecast", notes: "Digital sig $64 + e-invoice $26 + tax reg $40", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Legal — Business Registration", account_code: "3600", category_name: "Operating Expenses", category_type: "opex" },
  { id: 35, account_id: 17, period: "2026-03", budget: 14, actual: 0, variance: -14, status: "forecast", notes: "Veo3 $3.60 + Kling ~$10", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Content Tools (Veo3 + Kling)", account_code: "3700", category_name: "Operating Expenses", category_type: "opex" },
  { id: 36, account_id: 18, period: "2026-03", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Evaluating options", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Accounting Service", account_code: "3800", category_name: "Operating Expenses", category_type: "opex" },

  // ═══════════════════════════════════════════════════════════════════
  // 2026-04 (Apr — Full Stage 2, 50 bookings, breakeven month)
  // ═══════════════════════════════════════════════════════════════════
  // Revenue
  { id: 37, account_id: 1, period: "2026-04", budget: 150, actual: 0, variance: -150, status: "forecast", notes: "50 bookings × 300 CR ($3 each)", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "AI Influencer Booking", account_code: "1100", category_name: "Revenue", category_type: "revenue" },
  { id: 38, account_id: 2, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Not active yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Affiliate (Shopee/TikTok/IG)", account_code: "1200", category_name: "Revenue", category_type: "revenue" },
  { id: 39, account_id: 3, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Tracked via bookings", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Credit Top-up", account_code: "1300", category_name: "Revenue", category_type: "revenue" },
  { id: 40, account_id: 4, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "VIP not launched yet", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "VIP Subscription", account_code: "1400", category_name: "Revenue", category_type: "revenue" },
  // COGS
  { id: 41, account_id: 5, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Google AI (Imagen/Veo)", account_code: "2100", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 42, account_id: 6, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Grok API (xAI)", account_code: "2200", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 43, account_id: 7, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Kling API", account_code: "2300", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 44, account_id: 8, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free via NVIDIA dev program", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "MidJourney API", account_code: "2400", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 45, account_id: 9, period: "2026-04", budget: 3, actual: 0, variance: -3, status: "forecast", notes: "2% fee on ~$150 VND bookings", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Sepay Fee (2% VND)", account_code: "2510", category_name: "Cost of Goods Sold", category_type: "cogs" },
  { id: 46, account_id: 10, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "No USD transactions expected", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "PayPal Fee (3.49% USD)", account_code: "2520", category_name: "Cost of Goods Sold", category_type: "cogs" },
  // OpEx
  { id: 47, account_id: 11, period: "2026-04", budget: 20, actual: 0, variance: -20, status: "forecast", notes: "Vercel Pro plan", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Vercel Pro", account_code: "3100", category_name: "Operating Expenses", category_type: "opex" },
  { id: 48, account_id: 12, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Free tier", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Supabase (Free Tier)", account_code: "3200", category_name: "Operating Expenses", category_type: "opex" },
  { id: 49, account_id: 13, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Minimal", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Cloudflare R2", account_code: "3300", category_name: "Operating Expenses", category_type: "opex" },
  { id: 50, account_id: 14, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Already paid", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Domain (aitemplate.co)", account_code: "3400", category_name: "Operating Expenses", category_type: "opex" },
  { id: 51, account_id: 15, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "Organic growth only", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "IG Ads (Vey + Bruce)", account_code: "3500", category_name: "Operating Expenses", category_type: "opex" },
  { id: 52, account_id: 16, period: "2026-04", budget: 0, actual: 0, variance: 0, status: "forecast", notes: "All legal setup done", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Legal — Business Registration", account_code: "3600", category_name: "Operating Expenses", category_type: "opex" },
  { id: 53, account_id: 17, period: "2026-04", budget: 14, actual: 0, variance: -14, status: "forecast", notes: "Veo3 $3.60 + Kling ~$10", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Content Tools (Veo3 + Kling)", account_code: "3700", category_name: "Operating Expenses", category_type: "opex" },
  { id: 54, account_id: 18, period: "2026-04", budget: 40, actual: 0, variance: -40, status: "forecast", notes: "Accounting service ~1M VND/month", created_at: "2026-02-20", updated_at: "2026-02-20", account_name: "Accounting Service", account_code: "3800", category_name: "Operating Expenses", category_type: "opex" },
];

/* ------------------------------------------------------------------ */
/*  KPI Metrics (12 — matches Notion H.III)                            */
/* ------------------------------------------------------------------ */
export const KPI_METRICS: KPIMetric[] = [
  // Finance
  { id: 1, name: "Burn Rate", group_name: "finance", unit: "USD/mo", target_value: 120, current_value: 40, period: "2026-02", status: "on_track", notes: "Target: <$120/mo. Feb only Vercel $20 + Legal $20", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 2, name: "Runway", group_name: "finance", unit: "months", target_value: 3, current_value: 8, period: "2026-02", status: "on_track", notes: "Low burn = long runway", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 3, name: "Gross Margin", group_name: "finance", unit: "%", target_value: 0, current_value: 0, period: "2026-02", status: "off_track", notes: "No revenue yet in Feb", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 4, name: "MRR", group_name: "finance", unit: "USD/mo", target_value: 50, current_value: 0, period: "2026-02", status: "off_track", notes: "Target: $50 MRR by Apr", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 5, name: "Net Profit Sprint", group_name: "finance", unit: "USD", target_value: 0, current_value: -40, period: "2026-02", status: "off_track", notes: "Sprint total target: breakeven. Feb: -$40", created_at: "2026-02-20", updated_at: "2026-02-20" },
  // Marketing
  { id: 6, name: "CAC", group_name: "marketing", unit: "USD", target_value: 5, current_value: 0, period: "2026-02", status: "warning", notes: "Target: <$5 per customer", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 7, name: "Vey IG Followers", group_name: "marketing", unit: "followers", target_value: 2000, current_value: 0, period: "2026-02", status: "off_track", notes: "Target 2K by end of sprint", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 8, name: "Bruce IG Followers", group_name: "marketing", unit: "followers", target_value: 1000, current_value: 0, period: "2026-02", status: "off_track", notes: "Target 1K by end of sprint", created_at: "2026-02-20", updated_at: "2026-02-20" },
  // Growth
  { id: 9, name: "Traffic from IG", group_name: "growth", unit: "visits/mo", target_value: 500, current_value: 0, period: "2026-02", status: "off_track", notes: "IG → aitemplate.co visits", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 10, name: "User Signups (Bookings)", group_name: "growth", unit: "users", target_value: 60, current_value: 0, period: "2026-02", status: "off_track", notes: "10 month 1 + 50 month 2 = 60 total", created_at: "2026-02-20", updated_at: "2026-02-20" },
  // Product
  { id: 11, name: "Platform Waves Complete", group_name: "product", unit: "%", target_value: 100, current_value: 0, period: "2026-02", status: "off_track", notes: "Wave 1-5 all CPs", created_at: "2026-02-20", updated_at: "2026-02-20" },
  { id: 12, name: "Content Pages Active", group_name: "product", unit: "pages", target_value: 5, current_value: 0, period: "2026-02", status: "off_track", notes: "Personal, SoloFlows, Vey, Bruce, Old Man Fitness", created_at: "2026-02-20", updated_at: "2026-02-20" },
];

/* ------------------------------------------------------------------ */
/*  Available Cash (Sprint budget)                                     */
/* ------------------------------------------------------------------ */
export const AVAILABLE_CASH = 385;

/* ------------------------------------------------------------------ */
/*  Dashboard Summary (computed from ledger)                           */
/*  Uses BUDGET as primary display — this is a planning dashboard.     */
/*  Actuals are tracked on the CashFlow page for comparison.           */
/* ------------------------------------------------------------------ */

/** Pick the effective value for an entry: actual if recorded, budget otherwise */
function effective(e: LedgerEntry): number {
  return e.status === "actual" && e.actual !== 0 ? e.actual : e.budget;
}

export function computeSummary(period?: string): DashboardSummary {
  const periods = ["2026-02", "2026-03", "2026-04"];
  const filterEntries = period && period !== "all"
    ? LEDGER_ENTRIES.filter((e) => e.period === period)
    : LEDGER_ENTRIES;

  const rev = filterEntries.filter((e) => e.category_type === "revenue");
  const cogs = filterEntries.filter((e) => e.category_type === "cogs");
  const opex = filterEntries.filter((e) => e.category_type === "opex");

  const totalRevenue = rev.reduce((s, e) => s + effective(e), 0);
  const totalCogs = cogs.reduce((s, e) => s + effective(e), 0);
  const totalOpex = opex.reduce((s, e) => s + effective(e), 0);
  const netProfit = totalRevenue - totalCogs - totalOpex;
  const totalExpenses = totalCogs + totalOpex;
  const numPeriods = period && period !== "all" ? 1 : periods.length;
  const burnRate = numPeriods > 0 ? totalExpenses / numPeriods : 0;

  const budgetRevenue = rev.reduce((s, e) => s + e.budget, 0);
  const budgetCogs = cogs.reduce((s, e) => s + e.budget, 0);
  const budgetOpex = opex.reduce((s, e) => s + e.budget, 0);

  const revenueByPeriod = periods.map((p) => ({
    period: p,
    amount: LEDGER_ENTRIES.filter((e) => e.period === p && e.category_type === "revenue").reduce((s, e) => s + effective(e), 0),
  }));

  const expenseByPeriod = periods.map((p) => ({
    period: p,
    amount: LEDGER_ENTRIES.filter((e) => e.period === p && (e.category_type === "cogs" || e.category_type === "opex")).reduce((s, e) => s + effective(e), 0),
  }));

  const expenseByCategory = [
    { name: "Cost of Goods Sold", amount: totalCogs, color: "#F59E0B" },
    { name: "Operating Expenses", amount: totalOpex, color: "#EF4444" },
  ];

  const subcategories = ["Booking", "Affiliate", "Credits", "VIP"];
  const revenueBySubcategory = subcategories.map((sub) => ({
    name: sub,
    amount: filterEntries.filter((e) => e.category_type === "revenue" && ACCOUNTS.find((a) => a.id === e.account_id)?.subcategory === sub).reduce((s, e) => s + effective(e), 0),
  }));

  const monthlyTrend = periods.map((p) => {
    const pEntries = LEDGER_ENTRIES.filter((e) => e.period === p);
    const r = pEntries.filter((e) => e.category_type === "revenue").reduce((s, e) => s + effective(e), 0);
    const c = pEntries.filter((e) => e.category_type === "cogs").reduce((s, e) => s + effective(e), 0);
    const o = pEntries.filter((e) => e.category_type === "opex").reduce((s, e) => s + effective(e), 0);
    return { period: p, revenue: r, cogs: c, opex: o, net: r - c - o };
  });

  return {
    total_revenue: totalRevenue,
    total_cogs: totalCogs,
    total_opex: totalOpex,
    total_capex: 0,
    net_profit: netProfit,
    burn_rate: burnRate,
    available_cash: AVAILABLE_CASH,
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
