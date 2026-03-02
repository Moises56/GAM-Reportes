"use client"

import { AreaChart } from "@/components/charts/area-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { CHART_COLORS } from "@/lib/constants"

interface OverviewChartsProps {
  chartData?: Record<string, unknown>[]
  pieData?: { name: string; value: number }[]
}

export function OverviewCharts({ chartData, pieData }: OverviewChartsProps) {
  if (chartData) {
    return (
      <AreaChart
        data={chartData}
        xKey="mes"
        series={[
          { key: "amahsa", name: "AMAHSA", color: CHART_COLORS.amahsa },
          { key: "cosemsa", name: "COSEMSA", color: CHART_COLORS.cosemsa },
        ]}
        height={280}
      />
    )
  }

  if (pieData) {
    return <PieChart data={pieData} height={280} />
  }

  return null
}
