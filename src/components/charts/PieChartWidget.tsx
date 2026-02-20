import type { ReactNode } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartWidgetProps {
  data: PieDataItem[];
  height?: number;
  innerRadius?: number;
  formatValue?: (v: number) => string;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel(props: PieLabelRenderProps): ReactNode {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const percent = Number(props.percent ?? 0);

  if (percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function renderTooltip(
  formatValue?: (v: number) => string,
): (props: TooltipContentProps<number | string, number | string>) => ReactNode {
  return ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const entry = payload[0];
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.payload?.color as string }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-card-foreground">
            {formatValue
              ? formatValue(Number(entry.value ?? 0))
              : Number(entry.value ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };
}

export default function PieChartWidget({
  data,
  height = 350,
  innerRadius = 0,
  formatValue,
}: PieChartWidgetProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={Math.min(height * 0.35, 120)}
          dataKey="value"
          nameKey="name"
          label={renderCustomLabel}
          labelLine={false}
          strokeWidth={2}
          stroke="var(--color-card)"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>

        <Tooltip content={renderTooltip(formatValue)} />

        <Legend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: 16 }}
          formatter={(value) => (
            <span className={cn("text-sm text-muted-foreground")}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
