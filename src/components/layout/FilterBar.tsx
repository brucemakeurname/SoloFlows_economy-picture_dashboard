import { useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { FilterContext } from "@/App";
import type { Category } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "Tat ca" },
  { value: "forecast", label: "Du bao" },
  { value: "actual", label: "Thuc te" },
  { value: "closed", label: "Da dong" },
] as const;

export function FilterBar() {
  const { filters, setFilters } = useContext(FilterContext);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      const result = await api.get<Category[]>("categories.php");
      if (!cancelled && result.data) {
        setCategories(result.data);
      }
    }
    loadCategories();
    return () => { cancelled = true; };
  }, []);

  const selectClass = cn(
    "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring"
  );

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground">
          Trang thai
        </label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Loai</span>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isSelected = filters.categories.includes(cat.type);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setFilters((f) => {
                    const current = f.categories;
                    const next = current.includes(cat.type)
                      ? current.filter((t) => t !== cat.type)
                      : [...current, cat.type];
                    return { ...f, categories: next };
                  });
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
