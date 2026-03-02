import { NextResponse } from "next/server"
import { reportFiltersSchema } from "@/schemas/report-filters.schema"
import { getBoletasKPIs, getBoletasTendenciaMensual, getBoletasDistribucionTransportista, getBoletasTopRutas, getBoletasPaginadas } from "@/lib/queries/boletas"
import { getBasculaKPIs, getBasculaPaginada } from "@/lib/queries/bascula"
import { getHospitalariosKPIs, getHospFacturacionMensual, getHospPorCategoria, getHospListado, getHospFacturas, getGestoresResumen, getCategorias } from "@/lib/queries/hospitalarios"
import { getFlotaResumen, getFlotaKPIs } from "@/lib/queries/flota"
import { getRutasResumen, getRutasKPIs } from "@/lib/queries/rutas"
import { getMultas, getMermas, getMultasKPIs } from "@/lib/queries/multas"
import { getFacturacionMensual, getFacturacionKPIs } from "@/lib/queries/facturacion"
import { getEstimacionVsReal } from "@/lib/queries/estimacion"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tipo: string }> }
) {
  try {
    const { tipo } = await params
    const { searchParams } = new URL(request.url)
    const rawFilters = Object.fromEntries(searchParams.entries())
    const filters = reportFiltersSchema.parse(rawFilters)

    switch (tipo) {
      case "produccion": {
        const [kpis, tendencia, distribucion, topRutas, boletas] = await Promise.all([
          getBoletasKPIs(filters),
          getBoletasTendenciaMensual(filters),
          getBoletasDistribucionTransportista(filters),
          getBoletasTopRutas(filters),
          getBoletasPaginadas(filters, filters.page, filters.pageSize, filters.sortBy, filters.sortDir),
        ])
        return NextResponse.json({ kpis, tendencia, distribucion, topRutas, boletas })
      }

      case "facturacion": {
        const [kpis, mensual, estimadoVsReal] = await Promise.all([
          getFacturacionKPIs(filters),
          getFacturacionMensual(filters),
          getEstimacionVsReal(filters.fechaInicio, filters.fechaFin),
        ])
        return NextResponse.json({ kpis, mensual, estimadoVsReal })
      }

      case "flota": {
        const [vehiculos, kpis] = await Promise.all([
          getFlotaResumen(filters),
          getFlotaKPIs(filters),
        ])
        return NextResponse.json({ vehiculos, kpis })
      }

      case "rutas": {
        const [rutas, kpis] = await Promise.all([
          getRutasResumen(filters),
          getRutasKPIs(filters),
        ])
        return NextResponse.json({ rutas, kpis })
      }

      case "multas": {
        const [multas, mermas, kpis] = await Promise.all([
          getMultas(filters),
          getMermas(filters),
          getMultasKPIs(filters),
        ])
        return NextResponse.json({ multas, mermas, kpis })
      }

      case "bascula": {
        const [kpis, pesajes] = await Promise.all([
          getBasculaKPIs(filters),
          getBasculaPaginada(filters, filters.page, filters.pageSize, filters.sortBy, filters.sortDir),
        ])
        return NextResponse.json({ kpis, pesajes })
      }

      case "comparativo": {
        const [kpisAmahsa, kpisCosemsa, factAmahsa, factCosemsa] = await Promise.all([
          getBoletasKPIs({ ...filters, transportistaId: 1 }),
          getBoletasKPIs({ ...filters, transportistaId: 2 }),
          getFacturacionKPIs({ ...filters, transportistaId: 1 }),
          getFacturacionKPIs({ ...filters, transportistaId: 2 }),
        ])
        return NextResponse.json({ amahsa: { kpis: kpisAmahsa, facturacion: factAmahsa }, cosemsa: { kpis: kpisCosemsa, facturacion: factCosemsa } })
      }

      case "hospitalarios": {
        const hospFilters = { fechaInicio: filters.fechaInicio, fechaFin: filters.fechaFin, categoriaId: rawFilters.categoriaId ? Number(rawFilters.categoriaId) : undefined }
        const [kpis, facturacionMensual, distribucion, categoriasList, establecimientos, facturas, gestores] = await Promise.all([
          getHospitalariosKPIs(hospFilters),
          getHospFacturacionMensual(hospFilters),
          getHospPorCategoria(),
          getCategorias(),
          getHospListado(hospFilters, filters.page, filters.pageSize),
          getHospFacturas(hospFilters, 1, 10),
          getGestoresResumen(),
        ])
        return NextResponse.json({ kpis, facturacionMensual, distribucion, categoriasList, establecimientos, facturas, gestores })
      }

      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }
  } catch (error) {
    console.error("Report API error:", error)
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })
  }
}
