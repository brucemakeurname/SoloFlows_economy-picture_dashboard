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
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/*  Icon mapping                                                               */
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "bg-gradient-to-b from-[hsl(222,47%,8%)] to-[hsl(222,47%,12%)]",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ---- Header / brand ---- */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">
                Economy Picture
              </span>
              <p className="text-[10px] font-medium text-white/40">Solo Flows</p>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---- Navigation ---- */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = resolveIcon(item.icon);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/50 hover:bg-white/5 hover:text-white/80"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm shadow-primary/30"
                              : "text-current group-hover:bg-white/5"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-sm shadow-accent/50" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---- Footer ---- */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <p className="text-[11px] text-white/40">v1.0 — Live</p>
          </div>
        </div>
      </aside>
    </>
  );
}
