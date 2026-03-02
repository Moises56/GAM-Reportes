import { getPool, sql } from "@/lib/db"
import { TRANSPORTISTA, LBS_PER_TON } from "@/lib/constants"

interface FacturacionFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
}

function buildFacturacionWhere(filters: FacturacionFilters) {
  const conditions = ["TransportistaNombre IN ('AMAHSA', 'COSEMSA')"]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: { name: string; type: any; value: unknown }[] = []

  if (filters.fechaInicio) {
    conditions.push("BoletaPesoFecha >= @fechaInicio")
    params.push({ name: "fechaInicio", type: sql.Date, value: filters.fechaInicio })
  }
  if (filters.fechaFin) {
    conditions.push("BoletaPesoFecha <= @fechaFin")
    params.push({ name: "fechaFin", type: sql.Date, value: filters.fechaFin })
  }
  if (filters.transportistaId) {
    const names: Record<number, string> = { 1: "AMAHSA", 2: "COSEMSA" }
    conditions.push("TransportistaNombre = @transportista")
    params.push({ name: "transportista", type: sql.NVarChar, value: names[filters.transportistaId] || "" })
  }

  return { where: `WHERE ${conditions.join(" AND ")}`, params }
}

export async function getFacturacionMensual(filters: FacturacionFilters = {}) {
  const pool = await getPool()
  const { where, params } = buildFacturacionWhere(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT
      CONVERT(char(7), BoletaPesoFecha, 126) as mes,
      TransportistaNombre as transportista,
      COUNT(*) as boletas,
      SUM(PESONETO) as pesoNetoLbs,
      SUM(PESONETO) / ${LBS_PER_TON} as toneladas
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where}
    GROUP BY CONVERT(char(7), BoletaPesoFecha, 126), TransportistaNombre
    ORDER BY mes, TransportistaNombre
  `)

  return result.recordset.map((row) => {
    const precioPorTon = row.transportista === "AMAHSA"
      ? TRANSPORTISTA.AMAHSA.pricePerTon
      : TRANSPORTISTA.COSEMSA.pricePerTon

    return {
      ...row,
      precioPorTon,
      totalUSD: row.toneladas * precioPorTon,
    }
  })
}

export async function getFacturacionKPIs(filters: FacturacionFilters = {}) {
  const pool = await getPool()
  const { where, params } = buildFacturacionWhere(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT
      TransportistaNombre as transportista,
      SUM(PESONETO) / ${LBS_PER_TON} as toneladas,
      COUNT(*) as boletas
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where}
    GROUP BY TransportistaNombre
  `)

  let totalUSD = 0
  const byTransportista = result.recordset.map((row) => {
    const precioPorTon = row.transportista === "AMAHSA"
      ? TRANSPORTISTA.AMAHSA.pricePerTon
      : TRANSPORTISTA.COSEMSA.pricePerTon
    const usd = row.toneladas * precioPorTon
    totalUSD += usd
    return { ...row, precioPorTon, totalUSD: usd }
  })

  return { totalUSD, byTransportista }
}
