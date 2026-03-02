"use client"

import { Suspense } from "react"
import { AreaChart } from "@/components/charts/area-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { CHART_COLORS } from "@/lib/constants"
import { formatNumber, formatDate } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProduccionClientProps {
  chartData: Record<string, unknown>[]
  topRutas: Record<string, unknown>[]
  boletas: {
    data: Record<string, unknown>[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

function PaginationControls({ boletas }: { boletas: ProduccionClientProps["boletas"] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-[11px] text-muted-foreground">
        Mostrando {((boletas.page - 1) * boletas.pageSize) + 1}-
        {Math.min(boletas.page * boletas.pageSize, boletas.total)} de{" "}
        {formatNumber(boletas.total)}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(boletas.page - 1)}
          disabled={boletas.page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 text-xs">
          {boletas.page} / {boletas.totalPages}
        </span>
        <button
          onClick={() => goToPage(boletas.page + 1)}
          disabled={boletas.page >= boletas.totalPages}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ProduccionClient({ chartData, topRutas, boletas }: ProduccionClientProps) {
  return (
    <>
      {/* Filters */}
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="produccion" showTurno showExport />
      </Suspense>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Tendencia Mensual de Peso</h3>
          <AreaChart
            data={chartData}
            xKey="mes"
            series={[
              { key: "amahsa", name: "AMAHSA", color: CHART_COLORS.amahsa },
              { key: "cosemsa", name: "COSEMSA", color: CHART_COLORS.cosemsa },
            ]}
            height={280}
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Top 20 Rutas por Peso</h3>
          <BarChart
            data={topRutas.slice(0, 20)}
            xKey="ruta"
            series={[{ key: "pesoNeto", name: "Peso Neto (lbs)", color: CHART_COLORS.primary }]}
            layout="vertical"
            height={400}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Detalle de Boletas</h3>
        <DataTable
          columns={[
            { key: "fecha", label: "Fecha", render: (v) => formatDate(v as string) },
            { key: "transportista", label: "Transportista" },
            { key: "placa", label: "Placa" },
            { key: "ruta", label: "Ruta" },
            { key: "pesoBruto", label: "Bruto", align: "right", render: (v) => formatNumber(v as number) },
            { key: "tara", label: "Tara", align: "right", render: (v) => formatNumber(v as number) },
            { key: "pesoNeto", label: "Neto", align: "right", render: (v) => formatNumber(v as number) },
          ]}
          data={boletas.data}
        />
        <Suspense>
          <PaginationControls boletas={boletas} />
        </Suspense>
      </div>
    </>
  )
}
