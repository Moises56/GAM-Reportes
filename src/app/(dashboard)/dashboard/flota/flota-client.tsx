"use client"

import { Suspense } from "react"
import { BarChart } from "@/components/charts/bar-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { CHART_COLORS } from "@/lib/constants"
import { formatNumber } from "@/lib/utils"

interface FlotaClientProps {
  vehiculos: Record<string, unknown>[]
}

export function FlotaClient({ vehiculos }: FlotaClientProps) {
  // Top 20 vehicles by load for chart
  const top20 = [...vehiculos]
    .filter((v) => (v.viajes as number) > 0)
    .sort((a, b) => (b.promedioPorViaje as number) - (a.promedioPorViaje as number))
    .slice(0, 20)
    .map((v) => ({
      vehiculo: v.placa || v.unidad || `V-${v.VehiculoId}`,
      promedio: Math.round(v.promedioPorViaje as number),
      transportista: v.transportista,
    }))

  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="flota" showExport />
      </Suspense>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Carga Promedio por Vehículo (lbs) - Top 20</h3>
        <BarChart
          data={top20}
          xKey="vehiculo"
          series={[{ key: "promedio", name: "Promedio (lbs)", color: CHART_COLORS.primary }]}
          layout="vertical"
          height={500}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Detalle de Flota</h3>
        <DataTable
          columns={[
            { key: "unidad", label: "Unidad" },
            { key: "placa", label: "Placa" },
            { key: "modelo", label: "Modelo" },
            { key: "capacidad", label: "Capacidad", align: "right", render: (v) => v ? formatNumber(v as number) : "—" },
            { key: "transportista", label: "Transportista" },
            { key: "viajes", label: "Viajes", align: "right", render: (v) => formatNumber(v as number) },
            { key: "pesoTotal", label: "Peso Total (lbs)", align: "right", render: (v) => formatNumber(v as number) },
            { key: "promedioPorViaje", label: "Promedio/Viaje", align: "right", render: (v) => formatNumber(v as number) },
          ]}
          data={vehiculos}
        />
      </div>
    </>
  )
}
