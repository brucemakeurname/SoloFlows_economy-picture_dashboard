import { useState, useMemo, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

type SortDirection = "asc" | "desc";

interface SortState {
  key: string;
  direction: SortDirection;
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={cn(
        "ml-1 inline-block transition-opacity",
        active ? "opacity-100" : "opacity-30"
      )}
    >
      <path
        d="M7 2l3 4H4l3-4z"
        fill={
          active && direction === "asc"
            ? "currentColor"
            : "var(--color-muted-foreground)"
        }
        opacity={active && direction === "asc" ? 1 : 0.4}
      />
      <path
        d="M7 12l3-4H4l3 4z"
        fill={
          active && direction === "desc"
            ? "currentColor"
            : "var(--color-muted-foreground)"
        }
        opacity={active && direction === "desc" ? 1 : 0.4}
      />
    </svg>
  );
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <TableRow>
      {Array.from({ length: colCount }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "Khong co du lieu",
  onRowClick,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        if (prev?.key === key) {
          return prev.direction === "asc"
            ? { key, direction: "desc" }
            : null;
        }
        return { key, direction: "asc" };
      });
    },
    []
  );

  const sortedData = useMemo(() => {
    if (!sort) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal), "vi");
      }

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sort]);

  const alignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                alignClass(col.align),
                col.sortable && "cursor-pointer select-none hover:text-foreground"
              )}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
            >
              <span className="inline-flex items-center">
                {col.header}
                {col.sortable && (
                  <SortIcon
                    active={sort?.key === col.key}
                    direction={sort?.key === col.key ? sort.direction : "asc"}
                  />
                )}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} colCount={columns.length} />
          ))
        ) : sortedData.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={columns.length}
              className="py-12 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          sortedData.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                rowIndex % 2 === 1 && "bg-muted/30",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={alignClass(col.align)}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
