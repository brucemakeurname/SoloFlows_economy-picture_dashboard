import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/constants";

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
}

export default function GaugeChart({
  value,
  max,
  label,
  unit,
  color = CHART_COLORS.primary,
  size = 200,
}: GaugeChartProps) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const remaining = max - clampedValue;
  const percentage = max > 0 ? Math.round((clampedValue / max) * 100) : 0;

  const data = [
    { name: "filled", value: clampedValue },
    { name: "empty", value: remaining },
  ];

  const innerRadius = size * 0.3;
  const outerRadius = size * 0.42;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        <ResponsiveContainer width="100%" height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              strokeWidth={0}
              cornerRadius={4}
            >
              <Cell fill={color} />
              <Cell fill="var(--color-muted)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center text overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1"
          style={{ height: size * 0.6 }}
        >
          <p className="text-2xl font-extrabold text-foreground leading-none">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{unit}</p>
        </div>
      </div>

      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{percentage}% of target</p>
    </div>
  );
}
