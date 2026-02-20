export const CHART_COLORS = {
  primary: "hsl(221, 83%, 53%)",
  accent: "hsl(82, 85%, 55%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  destructive: "hsl(0, 84%, 60%)",
  muted: "hsl(215, 16%, 47%)",
  blue: "hsl(221, 83%, 53%)",
  green: "hsl(142, 71%, 45%)",
  orange: "hsl(38, 92%, 50%)",
  red: "hsl(0, 84%, 60%)",
  purple: "hsl(262, 83%, 58%)",
  teal: "hsl(180, 70%, 45%)",
};

export const CATEGORY_COLORS: Record<string, string> = {
  revenue: CHART_COLORS.green,
  cogs: CHART_COLORS.orange,
  opex: CHART_COLORS.red,
  capex: CHART_COLORS.purple,
  cash: CHART_COLORS.blue,
};

export const KPI_STATUS_CONFIG = {
  on_track: { label: "On Track", color: "bg-success/10 text-success" },
  warning: { label: "Warning", color: "bg-warning/10 text-warning" },
  off_track: { label: "Off Track", color: "bg-destructive/10 text-destructive" },
} as const;

export const KPI_GROUPS = ["finance", "marketing", "growth", "product"] as const;

export const LEDGER_STATUS_OPTIONS = [
  { value: "forecast", label: "Du bao" },
  { value: "actual", label: "Thuc te" },
  { value: "closed", label: "Da dong" },
] as const;

export const NAV_ITEMS = [
  { path: "/", label: "Tong quan", icon: "Home" },
  { path: "/cashflow", label: "Dong tien", icon: "Wallet" },
  { path: "/revenue", label: "Doanh thu", icon: "TrendingUp" },
  { path: "/expenses", label: "Chi phi", icon: "CreditCard" },
  { path: "/kpi", label: "KPI", icon: "Gauge" },
  { path: "/data-entry", label: "Nhap lieu", icon: "Database" },
  { path: "/settings", label: "Cai dat", icon: "Settings" },
] as const;
