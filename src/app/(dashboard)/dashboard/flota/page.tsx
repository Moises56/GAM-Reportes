import { getFlotaResumen, getFlotaKPIs } from "@/lib/queries/flota"
import { formatNumber } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { FlotaClient } from "./flota-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function FlotaPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
  }

  const [vehiculos, kpis] = await Promise.all([
    getFlotaResumen(filters),
    getFlotaKPIs(filters),
  ])

  const vehiculosConViajes = vehiculos.filter((v) => v.viajes > 0)

  return (
    <div className="flex flex-col">
      <TopBar title="Flota" subtitle="Análisis de flota vehicular" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total Vehículos"
            value={formatNumber(kpis.totalVehiculos || 0)}
            icon="Truck"
          />
          <KPICard
            label="Vehículos AMAHSA"
            value={formatNumber(kpis.vehiculosAmahsa || 0)}
            icon="Truck"
          />
          <KPICard
            label="Vehículos COSEMSA"
            value={formatNumber(kpis.vehiculosCosemsa || 0)}
            icon="Truck"
          />
          <KPICard
            label="Con Actividad"
            value={formatNumber(vehiculosConViajes.length)}
            subtitle="Vehículos con viajes"
            icon="TrendingUp"
          />
        </div>

        <FlotaClient vehiculos={vehiculos} />
      </div>
    </div>
  )
}
