import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { ThemeContext, FilterContext } from "@/App";
import { useApi } from "@/hooks/useApi";
import type { Period } from "@/lib/types";

function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) => {
    if (item.path === "/") return pathname === "/";
    return pathname.startsWith(item.path);
  });
  return match?.label ?? "Dashboard";
}

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  const { dark, toggle } = useContext(ThemeContext);
  const { filters, setFilters } = useContext(FilterContext);

  const { data: periods } = useApi<Period[]>("periods.php");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border px-4",
        "bg-background/80 backdrop-blur-xl"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={filters.period}
          onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value }))}
          className={cn(
            "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          aria-label="Select period"
        >
          <option value="">All periods</option>
          {(periods ?? []).map((p) => (
            <option key={p.code} value={p.code}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          onClick={toggle}
          className={cn(
            "rounded-md p-2 text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground"
          )}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
