import type { ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface AreaConfig {
  key: string;
  color: string;
  name: string;
}

interface AreaChartWidgetProps {
  data: Record<string, unknown>[];
  xKey: string;
  areas: AreaConfig[];
  height?: number;
  stacked?: boolean;
  formatValue?: (v: number) => string;
}

function renderTooltip(
  formatValue?: (v: number) => string,
): (props: TooltipContentProps<number | string, number | string>) => ReactNode {
  return ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="mb-1.5 text-sm font-medium text-card-foreground">
          {String(label)}
        </p>
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey)}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-card-foreground">
              {formatValue
                ? formatValue(Number(entry.value ?? 0))
                : Number(entry.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };
}

export default function AreaChartWidget({
  data,
  xKey,
  areas,
  height = 350,
  stacked = false,
  formatValue,
}: AreaChartWidgetProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <defs>
          {areas.map((area) => (
            <linearGradient
              key={`gradient-${area.key}`}
              id={`gradient-${area.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          opacity={0.5}
        />

        <XAxis
          dataKey={xKey}
          className="text-xs"
          tick={{ fill: "var(--color-muted-foreground)" }}
        />

        <YAxis
          tickFormatter={formatValue}
          className="text-xs"
          tick={{ fill: "var(--color-muted-foreground)" }}
        />

        <Tooltip content={renderTooltip(formatValue)} />

        <Legend
          wrapperStyle={{ paddingTop: 12 }}
          formatter={(value) => (
            <span className={cn("text-sm text-muted-foreground")}>{value}</span>
          )}
        />

        {areas.map((area) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#gradient-${area.key})`}
            stackId={stacked ? "stack" : undefined}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
