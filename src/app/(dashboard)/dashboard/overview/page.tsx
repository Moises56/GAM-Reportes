import { getBoletasKPIs, getBoletasTendenciaMensual, getBoletasDistribucionTransportista, getBoletasRecientes } from "@/lib/queries/boletas"
import { getMultasKPIs } from "@/lib/queries/multas"
import { formatNumber, lbsToTons } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { OverviewCharts } from "./overview-charts"
import { OverviewTable } from "./overview-table"

export const dynamic = "force-dynamic"

export default async function OverviewPage() {
  let kpis, multasKPIs, tendencia, distribucion, recientes

  try {
    ;[kpis, multasKPIs, tendencia, distribucion, recientes] = await Promise.all([
      getBoletasKPIs(),
      getMultasKPIs(),
      getBoletasTendenciaMensual(),
      getBoletasDistribucionTransportista(),
      getBoletasRecientes(10),
    ])
  } catch (error) {
    console.error("Overview data error:", error)
    return (
      <div className="flex flex-col">
        <TopBar title="Overview" subtitle="Resumen general de operaciones" />
        <div className="p-6">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Error al cargar datos. Verifique la conexión a la base de datos.</p>
            <p className="mt-1 text-xs text-muted-foreground">{String(error)}</p>
          </div>
        </div>
      </div>
    )
  }

  const totalTons = lbsToTons(kpis.pesoNetoTotal || 0)

  // Transform tendencia for chart - pivot by month
  const tendenciaByMonth: Record<string, Record<string, number>> = {}
  for (const row of tendencia) {
    if (!tendenciaByMonth[row.mes]) {
      tendenciaByMonth[row.mes] = { mes: row.mes } as unknown as Record<string, number>
    }
    const key = row.transportista === "AMAHSA" ? "amahsa" : row.transportista === "COSEMSA" ? "cosemsa" : "otros"
    tendenciaByMonth[row.mes][key] = (tendenciaByMonth[row.mes][key] || 0) + row.pesoNeto
  }
  const chartData = Object.values(tendenciaByMonth)

  // Transform distribucion for pie chart
  const pieData = distribucion.map((row) => ({
    name: row.name,
    value: row.pesoNeto,
  }))

  return (
    <div className="flex flex-col">
      <TopBar title="Overview" subtitle="Resumen general de operaciones" />

      <div className="space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard
            label="Total Toneladas"
            value={formatNumber(totalTons, 0)}
            subtitle={`${formatNumber(kpis.pesoNetoTotal || 0)} lbs netas`}
            icon="Weight"
          />
          <KPICard
            label="Total Boletas"
            value={formatNumber(kpis.totalBoletas || 0)}
            subtitle="Boletas activas"
            icon="FileText"
          />
          <KPICard
            label="Promedio/Viaje"
            value={`${formatNumber(kpis.promedioViaje || 0)} lbs`}
            subtitle={`${formatNumber(lbsToTons(kpis.promedioViaje || 0), 3)} tons`}
            icon="TrendingUp"
          />
          <KPICard
            label="Vehículos Activos"
            value={formatNumber(kpis.vehiculosActivos || 0)}
            subtitle="Con actividad registrada"
            icon="Truck"
          />
          <KPICard
            label="Multas"
            value={formatNumber(multasKPIs.totalMultas || 0)}
            subtitle={`L ${formatNumber(multasKPIs.montoMultas || 0, 2)}`}
            icon="AlertTriangle"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Tendencia Mensual de Peso (lbs)</h3>
            <OverviewCharts chartData={chartData} />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Distribución por Transportista</h3>
            <OverviewCharts pieData={pieData} />
          </div>
        </div>

        {/* Recent boletas table */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Últimas 10 Boletas</h3>
          <OverviewTable data={recientes} />
        </div>
      </div>
    </div>
  )
}
