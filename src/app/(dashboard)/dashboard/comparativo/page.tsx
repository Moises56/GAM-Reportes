import { getBoletasKPIs, getBoletasTendenciaMensual } from "@/lib/queries/boletas"
import { getFacturacionKPIs } from "@/lib/queries/facturacion"
import { getFlotaKPIs } from "@/lib/queries/flota"
import { formatNumber, formatCurrency, lbsToTons } from "@/lib/utils"
import { TopBar } from "@/components/layout/top-bar"
import { ComparativoClient } from "./comparativo-client"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ComparativoPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
  }

  const [
    kpisAmahsa,
    kpisCosemsa,
    factAmahsa,
    factCosemsa,
    flotaKPIs,
    tendencia,
  ] = await Promise.all([
    getBoletasKPIs({ ...filters, transportistaId: 1 }),
    getBoletasKPIs({ ...filters, transportistaId: 2 }),
    getFacturacionKPIs({ ...filters, transportistaId: 1 }),
    getFacturacionKPIs({ ...filters, transportistaId: 2 }),
    getFlotaKPIs(),
    getBoletasTendenciaMensual(filters),
  ])

  // Build comparison data
  const comparacion = [
    {
      metric: "Total Boletas",
      amahsa: formatNumber(kpisAmahsa.totalBoletas || 0),
      cosemsa: formatNumber(kpisCosemsa.totalBoletas || 0),
    },
    {
      metric: "Toneladas",
      amahsa: formatNumber(lbsToTons(kpisAmahsa.pesoNetoTotal || 0), 0),
      cosemsa: formatNumber(lbsToTons(kpisCosemsa.pesoNetoTotal || 0), 0),
    },
    {
      metric: "Peso Neto (lbs)",
      amahsa: formatNumber(kpisAmahsa.pesoNetoTotal || 0),
      cosemsa: formatNumber(kpisCosemsa.pesoNetoTotal || 0),
    },
    {
      metric: "Promedio/Viaje (lbs)",
      amahsa: formatNumber(kpisAmahsa.promedioViaje || 0),
      cosemsa: formatNumber(kpisCosemsa.promedioViaje || 0),
    },
    {
      metric: "Vehículos Activos",
      amahsa: formatNumber(kpisAmahsa.vehiculosActivos || 0),
      cosemsa: formatNumber(kpisCosemsa.vehiculosActivos || 0),
    },
    {
      metric: "Precio/Ton (USD)",
      amahsa: "$32.31",
      cosemsa: "$26.90",
    },
    {
      metric: "Facturación USD",
      amahsa: formatCurrency(factAmahsa.totalUSD || 0),
      cosemsa: formatCurrency(factCosemsa.totalUSD || 0),
    },
    {
      metric: "Vehículos Registrados",
      amahsa: formatNumber(flotaKPIs.vehiculosAmahsa || 0),
      cosemsa: formatNumber(flotaKPIs.vehiculosCosemsa || 0),
    },
  ]

  // Market share pie
  const totalPeso = (kpisAmahsa.pesoNetoTotal || 0) + (kpisCosemsa.pesoNetoTotal || 0)
  const pieData = [
    { name: "AMAHSA", value: kpisAmahsa.pesoNetoTotal || 0 },
    { name: "COSEMSA", value: kpisCosemsa.pesoNetoTotal || 0 },
  ]

  // Tendencia for overlay chart
  const tendenciaByMonth: Record<string, Record<string, unknown>> = {}
  for (const row of tendencia) {
    if (!tendenciaByMonth[row.mes]) {
      tendenciaByMonth[row.mes] = { mes: row.mes }
    }
    if (row.transportista === "AMAHSA") tendenciaByMonth[row.mes].amahsa = row.pesoNeto
    if (row.transportista === "COSEMSA") tendenciaByMonth[row.mes].cosemsa = row.pesoNeto
  }
  const chartData = Object.values(tendenciaByMonth)

  return (
    <div className="flex flex-col">
      <TopBar title="Comparativo" subtitle="AMAHSA vs COSEMSA" />

      <div className="space-y-6 p-6">
        <ComparativoClient
          comparacion={comparacion}
          pieData={pieData}
          chartData={chartData}
          totalPeso={totalPeso}
          kpisAmahsa={kpisAmahsa}
          kpisCosemsa={kpisCosemsa}
        />
      </div>
    </div>
  )
}
