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
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="inline-block"
      >
        <path
          d="M8 3v10M8 3l4 4M8 3L4 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (trend === "down") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="inline-block"
      >
        <path
          d="M8 13V3M8 13l4-4M8 13L4 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="inline-block"
    >
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {value}
            </p>

            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
                <TrendArrow trend={trend} />
                <span className="font-medium">
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
