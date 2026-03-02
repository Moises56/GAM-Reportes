"use client"

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { CHART_COLORS } from "@/lib/constants"

const COLORS = [
  CHART_COLORS.amahsa, CHART_COLORS.cosemsa, CHART_COLORS.amdc, CHART_COLORS.particulares,
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  "#a855f7", "#f43f5e", "#0ea5e9", "#eab308", "#22c55e", "#e879f9",
]

interface PieChartProps {
  data: { name: string; value: number }[]
  height?: number
  innerRadius?: number
  outerRadius?: number
}

export function PieChart({ data, height = 300, innerRadius = 60, outerRadius = 100 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label={((props: any) => `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`) as any}
          labelLine={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: any) => [Number(value).toLocaleString(), ""]) as any}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
