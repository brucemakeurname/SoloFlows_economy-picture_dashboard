import type { ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface LineConfig {
  key: string;
  color: string;
  name: string;
}

interface LineChartWidgetProps {
  data: Record<string, unknown>[];
  xKey: string;
  lines: LineConfig[];
  height?: number;
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

export default function LineChartWidget({
  data,
  xKey,
  lines,
  height = 350,
  formatValue,
}: LineChartWidgetProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
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

        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4, fill: line.color, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--color-card)" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
