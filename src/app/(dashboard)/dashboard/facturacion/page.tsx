import { getFacturacionMensual, getFacturacionKPIs } from "@/lib/queries/facturacion"
import { getEstimacionVsReal } from "@/lib/queries/estimacion"
import { getValorDolarActual } from "@/lib/queries/valor-dolar"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopBar } from "@/components/layout/top-bar"
import { FacturacionClient } from "./facturacion-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function FacturacionPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    transportistaId: params.transportistaId ? Number(params.transportistaId) : undefined,
  }

  const [kpis, mensual, estimadoVsReal, dolar] = await Promise.all([
    getFacturacionKPIs(filters),
    getFacturacionMensual(filters),
    getEstimacionVsReal(filters.fechaInicio, filters.fechaFin),
    getValorDolarActual(),
  ])

  const tipoCambio = dolar.venta || 25.0
  const totalHNL = kpis.totalUSD * tipoCambio

  // Chart data for monthly billing
  const mensualByMonth: Record<string, Record<string, unknown>> = {}
  for (const row of mensual) {
    if (!mensualByMonth[row.mes]) {
      mensualByMonth[row.mes] = { mes: row.mes }
    }
    const key = row.transportista === "AMAHSA" ? "amahsa" : "cosemsa"
    mensualByMonth[row.mes][key] = row.totalUSD
  }
  const chartMensual = Object.values(mensualByMonth)

  // Estimado vs Real chart
  const evr = estimadoVsReal.map((row) => ({
    mes: `${row.anio}-${String(row.mes).padStart(2, "0")}`,
    transportista: row.transportista,
    estimado: row.estimado || 0,
    real: row.real || 0,
  }))

  return (
    <div className="flex flex-col">
      <TopBar title="Facturación" subtitle="Cálculos de facturación por transportista" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Facturación Total USD"
            value={formatCurrency(kpis.totalUSD)}
            icon="DollarSign"
          />
          <KPICard
            label="Facturación Total HNL"
            value={formatCurrency(totalHNL, "HNL")}
            subtitle={`TC: L${formatNumber(tipoCambio, 2)}`}
            icon="DollarSign"
          />
          {kpis.byTransportista.map((t: { transportista: string; toneladas: number; totalUSD: number }) => (
            <KPICard
              key={t.transportista}
              label={t.transportista}
              value={formatCurrency(t.totalUSD)}
              subtitle={`${formatNumber(t.toneladas, 0)} toneladas`}
              icon="Truck"
            />
          ))}
        </div>

        <FacturacionClient
          chartMensual={chartMensual}
          estimadoVsReal={evr}
          mensual={mensual}
          tipoCambio={tipoCambio}
        />
      </div>
    </div>
  )
}
