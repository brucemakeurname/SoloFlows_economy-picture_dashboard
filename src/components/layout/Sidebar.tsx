import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Database,
  Gauge,
  Home,
  Layers,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/*  Icon mapping — maps string names from NAV_ITEMS to lucide icon components */
/* -------------------------------------------------------------------------- */

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  BarChart3,
  BookOpen,
  CreditCard,
  Database,
  Gauge,
  Layers,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Home;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* ---- Mobile backdrop ---- */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ---- Sidebar panel ---- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card",
          "transition-transform duration-300 ease-in-out",
          // Desktop: always visible
          "lg:translate-x-0",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ---- Header / brand ---- */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Economy Picture
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---- Navigation ---- */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = resolveIcon(item.icon);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---- Footer ---- */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Solo Flows v1.0</p>
        </div>
      </aside>
    </>
  );
}
