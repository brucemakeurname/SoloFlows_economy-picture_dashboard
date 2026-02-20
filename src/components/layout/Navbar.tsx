import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Moon, Sun, Calendar } from "lucide-react";
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
        "sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/50 px-4",
        "bg-background/70 backdrop-blur-xl"
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

        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filters.period}
            onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value }))}
            className={cn(
              "h-8 appearance-none rounded-lg border border-border/50 bg-muted/50 pl-8 pr-8 text-xs font-medium text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "transition-all duration-200"
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
        </div>

        <button
          onClick={toggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200",
            "hover:bg-muted hover:text-foreground",
            dark && "bg-muted/50 text-warning"
          )}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
