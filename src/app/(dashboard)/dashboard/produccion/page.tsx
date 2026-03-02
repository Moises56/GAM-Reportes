import { getBoletasKPIs, getBoletasTendenciaMensual, getBoletasTopRutas, getBoletasPaginadas } from "@/lib/queries/boletas"
import { formatNumber, lbsToTons } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { ProduccionClient } from "./produccion-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ProduccionPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
    turno: params.turno,
    rutaId: params.rutaId ? Number(params.rutaId) : undefined,
  }
  const page = Number(params.page) || 1
  const sortBy = params.sortBy || "BoletaPesoFecha"
  const sortDir = (params.sortDir as "asc" | "desc") || "desc"

  const [kpis, tendencia, topRutas, boletas] = await Promise.all([
    getBoletasKPIs(filters),
    getBoletasTendenciaMensual(filters),
    getBoletasTopRutas(filters),
    getBoletasPaginadas(filters, page, 50, sortBy, sortDir),
  ])

  const totalTons = lbsToTons(kpis.pesoNetoTotal || 0)

  // Pivot tendencia by month
  const tendenciaByMonth: Record<string, Record<string, unknown>> = {}
  for (const row of tendencia) {
    if (!tendenciaByMonth[row.mes]) {
      tendenciaByMonth[row.mes] = { mes: row.mes }
    }
    const key = row.transportista === "AMAHSA" ? "amahsa" : row.transportista === "COSEMSA" ? "cosemsa" : "otros"
    tendenciaByMonth[row.mes][key] = ((tendenciaByMonth[row.mes][key] as number) || 0) + row.pesoNeto
  }
  const chartData = Object.values(tendenciaByMonth)

  return (
    <div className="flex flex-col">
      <TopBar title="Producción" subtitle="Reporte de peso y recolección" />

      <div className="space-y-6 p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Toneladas Totales"
            value={formatNumber(totalTons, 0)}
            subtitle={`${formatNumber(kpis.pesoNetoTotal || 0)} lbs`}
            icon="Weight"
          />
          <KPICard
            label="Boletas"
            value={formatNumber(kpis.totalBoletas || 0)}
            icon="FileText"
          />
          <KPICard
            label="Promedio/Viaje"
            value={`${formatNumber(kpis.promedioViaje || 0)} lbs`}
            subtitle={`${formatNumber(lbsToTons(kpis.promedioViaje || 0), 3)} tons`}
            icon="TrendingUp"
          />
          <KPICard
            label="Vehículos"
            value={formatNumber(kpis.vehiculosActivos || 0)}
            icon="Truck"
          />
        </div>

        <ProduccionClient
          chartData={chartData}
          topRutas={topRutas}
          boletas={boletas}
        />
      </div>
    </div>
  )
}
