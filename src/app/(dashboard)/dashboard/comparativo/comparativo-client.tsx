"use client"

import { Suspense } from "react"
import { AreaChart } from "@/components/charts/area-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { CHART_COLORS } from "@/lib/constants"
import { formatNumber, lbsToTons } from "@/lib/utils"

interface ComparativoClientProps {
  comparacion: { metric: string; amahsa: string; cosemsa: string }[]
  pieData: { name: string; value: number }[]
  chartData: Record<string, unknown>[]
  totalPeso: number
  kpisAmahsa: Record<string, number>
  kpisCosemsa: Record<string, number>
}

export function ComparativoClient({
  comparacion,
  pieData,
  chartData,
  totalPeso,
  kpisAmahsa,
  kpisCosemsa,
}: ComparativoClientProps) {
  const amahsaPercent = totalPeso > 0 ? ((kpisAmahsa.pesoNetoTotal || 0) / totalPeso * 100) : 0
  const cosemsaPercent = totalPeso > 0 ? ((kpisCosemsa.pesoNetoTotal || 0) / totalPeso * 100) : 0

  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="comparativo" />
      </Suspense>

      {/* Side by side KPIs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AMAHSA */}
        <div className="rounded-xl border-2 border-amahsa/20 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amahsa" />
            <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.amahsa }}>AMAHSA</h3>
            <span className="ml-auto rounded-full bg-amahsa/10 px-2 py-0.5 text-xs font-medium" style={{ color: CHART_COLORS.amahsa }}>
              {amahsaPercent.toFixed(1)}% del total
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Boletas</p>
              <p className="text-lg font-semibold">{formatNumber(kpisAmahsa.totalBoletas || 0)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Toneladas</p>
              <p className="text-lg font-semibold">{formatNumber(lbsToTons(kpisAmahsa.pesoNetoTotal || 0), 0)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Promedio/Viaje</p>
              <p className="text-lg font-semibold">{formatNumber(kpisAmahsa.promedioViaje || 0)} lbs</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Vehículos</p>
              <p className="text-lg font-semibold">{formatNumber(kpisAmahsa.vehiculosActivos || 0)}</p>
            </div>
          </div>
        </div>

        {/* COSEMSA */}
        <div className="rounded-xl border-2 border-cosemsa/20 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-cosemsa" />
            <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.cosemsa }}>COSEMSA</h3>
            <span className="ml-auto rounded-full bg-cosemsa/10 px-2 py-0.5 text-xs font-medium" style={{ color: CHART_COLORS.cosemsa }}>
              {cosemsaPercent.toFixed(1)}% del total
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Boletas</p>
              <p className="text-lg font-semibold">{formatNumber(kpisCosemsa.totalBoletas || 0)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Toneladas</p>
              <p className="text-lg font-semibold">{formatNumber(lbsToTons(kpisCosemsa.pesoNetoTotal || 0), 0)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Promedio/Viaje</p>
              <p className="text-lg font-semibold">{formatNumber(kpisCosemsa.promedioViaje || 0)} lbs</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Vehículos</p>
              <p className="text-lg font-semibold">{formatNumber(kpisCosemsa.vehiculosActivos || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Tendencia Mensual Superpuesta</h3>
          <AreaChart
            data={chartData}
            xKey="mes"
            series={[
              { key: "amahsa", name: "AMAHSA", color: CHART_COLORS.amahsa },
              { key: "cosemsa", name: "COSEMSA", color: CHART_COLORS.cosemsa },
            ]}
            height={300}
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Participación de Mercado</h3>
          <PieChart data={pieData} height={300} innerRadius={70} outerRadius={110} />
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Tabla Comparativa</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Métrica</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider" style={{ color: CHART_COLORS.amahsa }}>AMAHSA</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider" style={{ color: CHART_COLORS.cosemsa }}>COSEMSA</th>
              </tr>
            </thead>
            <tbody>
              {comparacion.map((row) => (
                <tr key={row.metric} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium">{row.metric}</td>
                  <td className="px-4 py-2.5 text-right">{row.amahsa}</td>
                  <td className="px-4 py-2.5 text-right">{row.cosemsa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
