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
  accent?: string;
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
  accent,
}: KPICardProps) {
  const trendColor = {
    up: "text-success",
    down: "text-destructive",
    flat: "text-muted-foreground",
  }[trend];

  const accentColor = accent ?? (trend === "up" ? "hsl(142,71%,45%)" : trend === "down" ? "hsl(0,84%,60%)" : "hsl(221,83%,53%)");

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Accent top border */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 transition-all duration-300 group-hover:h-1"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }}
      />
      <CardContent className="px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-muted-foreground">{title}</p>
            <p className="mt-0.5 text-xl font-extrabold tracking-tight text-foreground leading-tight font-mono">
              {value}
            </p>
            {change !== undefined && (
              <div className={cn("mt-0.5 flex items-center gap-0.5 text-xs", trendColor)}>
                <TrendArrow trend={trend} />
                <span className="font-semibold">
                  {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground ml-0.5">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
