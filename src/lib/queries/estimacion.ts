import { getPool, sql } from "@/lib/db"
import { LBS_PER_TON } from "@/lib/constants"

export async function getEstimaciones(transportistaId?: number) {
  const pool = await getPool()
  const request = pool.request()
  let where = ""

  if (transportistaId) {
    where = "WHERE e.TransporteId = @transportistaId"
    request.input("transportistaId", sql.Int, transportistaId)
  }

  const result = await request.query(`
    SELECT
      e.EstimacionesId,
      e.EstimacionesFechaInicio as fechaInicio,
      e.EstimacionesFechaFinal as fechaFin,
      t.TransportistaNombre as transportista,
      e.EstimacionesTemporada as temporada,
      e.EstimacionesPrecioTon as precioTon,
      e.EstimacionesCobroRuta as cobroRuta
    FROM Estimacion e WITH (NOLOCK)
    INNER JOIN Transportista t WITH (NOLOCK) ON e.TransporteId = t.TransportistaId
    ${where}
    ORDER BY e.EstimacionesFechaInicio DESC
  `)

  return result.recordset
}

export async function getEstimacionVsReal(fechaInicio?: string, fechaFin?: string) {
  const pool = await getPool()
  const request = pool.request()

  const conditions = ["TransportistaNombre IN ('AMAHSA', 'COSEMSA')"]
  if (fechaInicio) {
    conditions.push("BoletaPesoFecha >= @fechaInicio")
    request.input("fechaInicio", sql.Date, fechaInicio)
  }
  if (fechaFin) {
    conditions.push("BoletaPesoFecha <= @fechaFin")
    request.input("fechaFin", sql.Date, fechaFin)
  }

  const result = await request.query(`
    SELECT
      CONVERT(char(7), BoletaPesoFecha, 126) as mes,
      TransportistaNombre as transportista,
      SUM(PESONETO) / ${LBS_PER_TON} as real
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    WHERE ${conditions.join(" AND ")}
    GROUP BY CONVERT(char(7), BoletaPesoFecha, 126), TransportistaNombre
    ORDER BY mes, TransportistaNombre
  `)

  return result.recordset.map((row) => ({
    mes: row.mes,
    anio: parseInt(row.mes.split("-")[0]),
    transportista: row.transportista,
    estimado: 0,
    real: row.real || 0,
  }))
}
