import { getRutasResumen, getRutasKPIs } from "@/lib/queries/rutas"
import { formatNumber } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { RutasClient } from "./rutas-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function RutasPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
    turno: params.turno,
  }

  const [rutas, kpis] = await Promise.all([
    getRutasResumen(filters),
    getRutasKPIs(filters),
  ])

  const rutasConViajes = rutas.filter((r) => r.viajes > 0)

  return (
    <div className="flex flex-col">
      <TopBar title="Rutas" subtitle="Rendimiento de rutas de recolección" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total Rutas"
            value={formatNumber(kpis.totalRutas || 0)}
            icon="Route"
          />
          <KPICard
            label="Total Colonias"
            value={formatNumber(kpis.totalColonias || 0)}
            subtitle="Colonias asignadas"
            icon="Route"
          />
          <KPICard
            label="Rutas Activas"
            value={formatNumber(rutasConViajes.length)}
            subtitle="Con viajes registrados"
            icon="TrendingUp"
          />
          <KPICard
            label="Viajes Totales"
            value={formatNumber(rutas.reduce((sum, r) => sum + r.viajes, 0))}
            icon="FileText"
          />
        </div>

        <RutasClient rutas={rutas} />
      </div>
    </div>
  )
}
