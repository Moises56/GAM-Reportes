import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getEmpresasKPIs, getEmpresasBoletas } from "@/lib/queries/empresas"
import { formatNumber, lbsToTons } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { EmpresasClient } from "./empresas-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function EmpresasPage({ searchParams }: Props) {
  const user = await getUser()

  if (!user || !["admin", "auditor", "gam-empresas"].includes(user.role)) {
    redirect("/dashboard/overview")
  }

  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
    search: params.search,
  }
  const page = Number(params.page) || 1

  const [kpis, boletas] = await Promise.all([
    getEmpresasKPIs(filters),
    getEmpresasBoletas(filters, page, 50),
  ])

  const LBS_PER_TON = 2204.62

  return (
    <div className="flex flex-col">
      <TopBar title="Empresas" subtitle="Registros de báscula AMAHSA y COSEMSA" />

      <div className="space-y-6 p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total Boletas"
            value={formatNumber(kpis.totalBoletas || 0)}
            icon="FileText"
          />
          <KPICard
            label="Peso Neto Total"
            value={`${formatNumber(lbsToTons(kpis.pesoNetoTotal || 0), 0)} ton`}
            subtitle={`${formatNumber(kpis.pesoNetoTotal || 0)} lbs`}
            icon="Weight"
          />
          <KPICard
            label="AMAHSA"
            value={formatNumber(kpis.boletasAmahsa || 0)}
            subtitle={`${formatNumber(Math.round((kpis.netoAmahsa || 0) / LBS_PER_TON))} ton`}
            icon="Truck"
          />
          <KPICard
            label="COSEMSA"
            value={formatNumber(kpis.boletasCosemsa || 0)}
            subtitle={`${formatNumber(Math.round((kpis.netoCosemsa || 0) / LBS_PER_TON))} ton`}
            icon="Truck"
          />
        </div>

        <EmpresasClient boletas={boletas} />
      </div>
    </div>
  )
}
