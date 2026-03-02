"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { CHART_COLORS } from "@/lib/constants"

interface BarChartProps {
  data: Record<string, unknown>[]
  xKey: string
  series: { key: string; name: string; color?: string }[]
  height?: number
  layout?: "horizontal" | "vertical"
  stacked?: boolean
}

export function BarChart({ data, xKey, series, height = 300, layout = "horizontal", stacked = false }: BarChartProps) {
  const isVertical = layout === "vertical"

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 10, left: isVertical ? 80 : 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color || Object.values(CHART_COLORS)[i]}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
