import { getHospitalariosKPIs, getHospFacturacionMensual, getHospPorCategoria, getHospListado, getHospFacturas, getGestoresResumen, getCategorias } from "@/lib/queries/hospitalarios"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { HospitalariosClient } from "./hospitalarios-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function HospitalariosPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    categoriaId: params.categoriaId ? Number(params.categoriaId) : undefined,
  }
  const page = Number(params.page) || 1
  const sortBy = params.sortBy || "HospitalarioNombre"
  const sortDir = (params.sortDir as "asc" | "desc") || "asc"

  const [kpis, facturacionMensual, distribucion, categoriasList, establecimientos, facturas, gestores] = await Promise.all([
    getHospitalariosKPIs(filters),
    getHospFacturacionMensual(filters),
    getHospPorCategoria(),
    getCategorias(),
    getHospListado(filters, page, 50, sortBy, sortDir),
    getHospFacturas(filters, 1, 10),
    getGestoresResumen(),
  ])

  return (
    <div className="flex flex-col">
      <TopBar title="Hospitalarios" subtitle="Desechos sólidos hospitalarios" />

      <div className="space-y-6 p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Establecimientos"
            value={formatNumber(kpis.totalEstablecimientos || 0)}
            subtitle="Generadores registrados"
            icon="Building"
          />
          <KPICard
            label="Total Facturado"
            value={formatCurrency(kpis.totalFacturado || 0, "HNL")}
            icon="DollarSign"
          />
          <KPICard
            label="Toneladas"
            value={formatNumber(kpis.totalToneladas || 0, 1)}
            subtitle="Desechos recolectados"
            icon="Weight"
          />
          <KPICard
            label="Facturas"
            value={formatNumber(kpis.totalFacturas || 0)}
            icon="FileText"
          />
        </div>

        <HospitalariosClient
          facturacionMensual={facturacionMensual}
          distribucion={distribucion}
          categoriasList={categoriasList}
          establecimientos={establecimientos}
          facturas={facturas}
          gestores={gestores}
        />
      </div>
    </div>
  )
}
