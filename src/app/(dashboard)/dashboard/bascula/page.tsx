import { getBasculaKPIs, getBasculaPaginada } from "@/lib/queries/bascula"
import { formatNumber, lbsToTons } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { BasculaClient } from "./bascula-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function BasculaPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
  }
  const page = Number(params.page) || 1
  const sortBy = params.sortBy || "BasculaPesajeFecha"
  const sortDir = (params.sortDir as "asc" | "desc") || "desc"

  const [kpis, pesajes] = await Promise.all([
    getBasculaKPIs(filters),
    getBasculaPaginada(filters, page, 50, sortBy, sortDir),
  ])

  return (
    <div className="flex flex-col">
      <TopBar title="Báscula" subtitle="Datos crudos de pesaje para auditoría" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total Pesajes"
            value={formatNumber(kpis.totalPesajes || 0)}
            icon="Scale"
          />
          <KPICard
            label="Peso Neto Total"
            value={`${formatNumber(lbsToTons(kpis.pesoNetoTotal || 0), 0)} tons`}
            subtitle={`${formatNumber(kpis.pesoNetoTotal || 0)} lbs`}
            icon="Weight"
          />
          <KPICard
            label="Promedio Neto"
            value={`${formatNumber(kpis.promedioNeto || 0)} lbs`}
            icon="TrendingUp"
          />
          <KPICard
            label="Vehículos Únicos"
            value={formatNumber(kpis.vehiculosUnicos || 0)}
            icon="Truck"
          />
        </div>

        <BasculaClient pesajes={pesajes} />
      </div>
    </div>
  )
}
