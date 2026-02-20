import type { ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarConfig {
  key: string;
  color: string;
  name: string;
}

interface BarChartWidgetProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: BarConfig[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
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

export default function BarChartWidget({
  data,
  xKey,
  bars,
  height = 350,
  stacked = false,
  horizontal = false,
  formatValue,
}: BarChartWidgetProps) {
  const layout = horizontal ? "vertical" : "horizontal";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          opacity={0.5}
        />

        {horizontal ? (
          <>
            <XAxis
              type="number"
              tickFormatter={formatValue}
              className="text-xs"
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              width={100}
              className="text-xs"
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
          </>
        ) : (
          <>
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
          </>
        )}

        <Tooltip
          content={renderTooltip(formatValue)}
          cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
        />

        <Legend
          wrapperStyle={{ paddingTop: 12 }}
          formatter={(value) => (
            <span className={cn("text-sm text-muted-foreground")}>{value}</span>
          )}
        />

        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            stackId={stacked ? "stack" : undefined}
            radius={stacked ? 0 : [4, 4, 0, 0]}
            maxBarSize={50}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
