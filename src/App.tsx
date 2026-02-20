import { Routes, Route } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Overview from "@/pages/Overview";
import CashFlow from "@/pages/CashFlow";
import Revenue from "@/pages/Revenue";
import Expenses from "@/pages/Expenses";
import KPIDashboard from "@/pages/KPIDashboard";
import DataEntry from "@/pages/DataEntry";
import Settings from "@/pages/Settings";
import type { FilterState } from "@/lib/types";

export const FilterContext = createContext<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}>({
  filters: { period: "2026-02", categories: [], status: "" },
  setFilters: () => {},
});

export const ThemeContext = createContext<{
  dark: boolean;
  toggle: () => void;
}>({ dark: false, toggle: () => {} });

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  const [filters, setFilters] = useState<FilterState>({
    period: "2026-02",
    categories: [],
    status: "",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeContext value={{ dark, toggle: () => setDark((d) => !d) }}>
      <FilterContext value={{ filters, setFilters }}>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/cashflow" element={<CashFlow />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/kpi" element={<KPIDashboard />} />
                <Route path="/data-entry" element={<DataEntry />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </FilterContext>
    </ThemeContext>
  );
}
