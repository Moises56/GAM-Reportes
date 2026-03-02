import { getMultas, getMermas, getMultasKPIs } from "@/lib/queries/multas"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { MultasClient } from "./multas-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function MultasPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
  }

  const [multas, mermas, kpis] = await Promise.all([
    getMultas(filters),
    getMermas(filters),
    getMultasKPIs(filters),
  ])

  return (
    <div className="flex flex-col">
      <TopBar title="Multas y Mermas" subtitle="Registro de multas e incumplimientos" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total Multas"
            value={formatNumber(kpis.totalMultas || 0)}
            icon="AlertTriangle"
          />
          <KPICard
            label="Monto Multas"
            value={formatCurrency(kpis.montoMultas || 0, "HNL")}
            icon="DollarSign"
          />
          <KPICard
            label="Total Mermas"
            value={formatNumber(kpis.totalMermas || 0)}
            icon="TrendingDown"
          />
          <KPICard
            label="Peso Mermas"
            value={`${formatNumber(kpis.pesoMermas || 0)} lbs`}
            icon="Weight"
          />
        </div>

        <MultasClient multas={multas} mermas={mermas} />
      </div>
    </div>
  )
}
