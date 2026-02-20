import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "flat";
}

function TrendArrow({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block">
        <path d="M8 3v10M8 3l4 4M8 3L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block">
        <path d="M8 13V3M8 13l4-4M8 13L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "flat",
}: KPICardProps) {
  const trendColor = {
    up: "text-success",
    down: "text-destructive",
    flat: "text-muted-foreground",
  }[trend];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-lg font-extrabold tracking-tight text-foreground leading-tight">
              {value}
            </p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
                <TrendArrow trend={trend} />
                <span className="font-medium">
                  {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground ml-0.5">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
