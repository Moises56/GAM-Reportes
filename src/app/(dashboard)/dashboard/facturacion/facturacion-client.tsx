"use client"

import { Suspense } from "react"
import { BarChart } from "@/components/charts/bar-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { CHART_COLORS } from "@/lib/constants"
import { formatNumber, formatCurrency } from "@/lib/utils"

interface FacturacionClientProps {
  chartMensual: Record<string, unknown>[]
  estimadoVsReal: { mes: string; transportista: string; estimado: number; real: number }[]
  mensual: Record<string, unknown>[]
  tipoCambio: number
}

export function FacturacionClient({ chartMensual, estimadoVsReal, mensual, tipoCambio }: FacturacionClientProps) {
  // Aggregate estimado vs real by month
  const evrByMonth: Record<string, Record<string, unknown>> = {}
  for (const row of estimadoVsReal) {
    if (!evrByMonth[row.mes]) {
      evrByMonth[row.mes] = { mes: row.mes }
    }
    const prefix = row.transportista === "AMAHSA" ? "amahsa" : "cosemsa"
    evrByMonth[row.mes][`${prefix}Est`] = row.estimado
    evrByMonth[row.mes][`${prefix}Real`] = row.real
  }
  const evrChart = Object.values(evrByMonth)

  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="facturacion" showExport />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Facturación Mensual por Transportista (USD)</h3>
          <BarChart
            data={chartMensual}
            xKey="mes"
            series={[
              { key: "amahsa", name: "AMAHSA", color: CHART_COLORS.amahsa },
              { key: "cosemsa", name: "COSEMSA", color: CHART_COLORS.cosemsa },
            ]}
            stacked
            height={300}
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Estimado vs Real (Toneladas)</h3>
          <BarChart
            data={evrChart}
            xKey="mes"
            series={[
              { key: "amahsaEst", name: "AMAHSA Est.", color: "#93c5fd" },
              { key: "amahsaReal", name: "AMAHSA Real", color: CHART_COLORS.amahsa },
              { key: "cosemsakEst", name: "COSEMSA Est.", color: "#86efac" },
              { key: "cosemsaReal", name: "COSEMSA Real", color: CHART_COLORS.cosemsa },
            ]}
            height={300}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Detalle Mensual de Facturación</h3>
        <DataTable
          columns={[
            { key: "mes", label: "Mes" },
            { key: "transportista", label: "Transportista" },
            { key: "boletas", label: "Boletas", align: "right", render: (v) => formatNumber(v as number) },
            { key: "toneladas", label: "Toneladas", align: "right", render: (v) => formatNumber(v as number, 2) },
            { key: "precioPorTon", label: "$/Ton", align: "right", render: (v) => formatCurrency(v as number) },
            { key: "totalUSD", label: "Total USD", align: "right", render: (v) => formatCurrency(v as number) },
            {
              key: "totalHNL",
              label: "Total HNL",
              align: "right",
              render: (v, row) => formatCurrency((row.totalUSD as number) * tipoCambio, "HNL"),
            },
          ]}
          data={mensual}
        />
      </div>
    </>
  )
}
