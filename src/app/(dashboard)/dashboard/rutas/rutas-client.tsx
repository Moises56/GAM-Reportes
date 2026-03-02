"use client"

import { Suspense } from "react"
import { BarChart } from "@/components/charts/bar-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { CHART_COLORS } from "@/lib/constants"
import { formatNumber } from "@/lib/utils"

interface RutasClientProps {
  rutas: Record<string, unknown>[]
}

export function RutasClient({ rutas }: RutasClientProps) {
  const top20 = [...rutas]
    .filter((r) => (r.viajes as number) > 0)
    .sort((a, b) => (b.pesoTotal as number) - (a.pesoTotal as number))
    .slice(0, 20)
    .map((r) => ({
      ruta: r.codigo || `R-${r.RutasId}`,
      peso: r.pesoTotal,
    }))

  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="rutas" showTurno showExport />
      </Suspense>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Distribución de Peso por Ruta - Top 20</h3>
        <BarChart
          data={top20}
          xKey="ruta"
          series={[{ key: "peso", name: "Peso Total (lbs)", color: CHART_COLORS.cosemsa }]}
          layout="vertical"
          height={500}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Detalle de Rutas</h3>
        <DataTable
          columns={[
            { key: "codigo", label: "Código" },
            { key: "turno", label: "Turno" },
            { key: "frecuencia", label: "Frecuencia" },
            { key: "transportista", label: "Transportista" },
            { key: "colonias", label: "Colonias", align: "right", render: (v) => formatNumber(v as number) },
            { key: "viajes", label: "Viajes", align: "right", render: (v) => formatNumber(v as number) },
            { key: "pesoTotal", label: "Peso Total (lbs)", align: "right", render: (v) => formatNumber(v as number) },
          ]}
          data={rutas}
        />
      </div>
    </>
  )
}
