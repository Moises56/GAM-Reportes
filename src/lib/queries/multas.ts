import { getPool, sql } from "@/lib/db"

interface MultaFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
}

export async function getMultas(filters: MultaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const conditions: string[] = []

  if (filters.fechaInicio) {
    conditions.push("om.OtrasMultaFechaMulta >= @fechaInicio")
    request.input("fechaInicio", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    conditions.push("om.OtrasMultaFechaMulta <= @fechaFin")
    request.input("fechaFin", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    conditions.push("om.TransportistaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const result = await request.query(`
    SELECT
      om.OtrasMultaId as id,
      om.OtrasMultaFechaMulta as fecha,
      t.TransportistaNombre as transportista,
      om.OtrasMultaMemorandum as memorandum,
      om.OtrasMultaTipodeIncumplimiento as tipoIncumplimiento,
      ISNULL(om.OtrasMultaMontoMulta, 0) as monto
    FROM OtrasMulta om WITH (NOLOCK)
    INNER JOIN Transportista t WITH (NOLOCK) ON om.TransportistaId = t.TransportistaId
    ${where}
    ORDER BY om.OtrasMultaFechaMulta DESC
  `)

  return result.recordset
}

export async function getMermas(filters: MultaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const conditions: string[] = []

  if (filters.fechaInicio) {
    conditions.push("rm.ReportesMermaFecha >= @fechaInicio")
    request.input("fechaInicio", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    conditions.push("rm.ReportesMermaFecha <= @fechaFin")
    request.input("fechaFin", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    conditions.push("rm.TransportistaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const result = await request.query(`
    SELECT
      rm.ReportesMermaId as id,
      rm.ReportesMermaFecha as fecha,
      t.TransportistaNombre as transportista,
      ISNULL(rm.ReportesMermaPesoMultado, 0) as peso,
      rm.ReportesMermaCodigo as observacion
    FROM ReportesMerma rm WITH (NOLOCK)
    INNER JOIN Transportista t WITH (NOLOCK) ON rm.TransportistaId = t.TransportistaId
    ${where}
    ORDER BY rm.ReportesMermaFecha DESC
  `)

  return result.recordset
}

export async function getMultasKPIs(filters: MultaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const multaConditions: string[] = []
  const mermaConditions: string[] = []

  if (filters.fechaInicio) {
    multaConditions.push("OtrasMultaFechaMulta >= @fechaInicio1")
    mermaConditions.push("ReportesMermaFecha >= @fechaInicio2")
    request.input("fechaInicio1", sql.Date, filters.fechaInicio)
    request.input("fechaInicio2", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    multaConditions.push("OtrasMultaFechaMulta <= @fechaFin1")
    mermaConditions.push("ReportesMermaFecha <= @fechaFin2")
    request.input("fechaFin1", sql.Date, filters.fechaFin)
    request.input("fechaFin2", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    multaConditions.push("TransportistaId = @tid1")
    mermaConditions.push("TransportistaId = @tid2")
    request.input("tid1", sql.Int, filters.transportistaId)
    request.input("tid2", sql.Int, filters.transportistaId)
  }

  const multaWhere = multaConditions.length > 0 ? `WHERE ${multaConditions.join(" AND ")}` : ""
  const mermaWhere = mermaConditions.length > 0 ? `WHERE ${mermaConditions.join(" AND ")}` : ""

  const result = await request.query(`
    SELECT
      (SELECT COUNT(*) FROM OtrasMulta WITH (NOLOCK) ${multaWhere}) as totalMultas,
      (SELECT ISNULL(SUM(OtrasMultaMontoMulta), 0) FROM OtrasMulta WITH (NOLOCK) ${multaWhere}) as montoMultas,
      (SELECT COUNT(*) FROM ReportesMerma WITH (NOLOCK) ${mermaWhere}) as totalMermas,
      (SELECT ISNULL(SUM(ReportesMermaPesoMultado), 0) FROM ReportesMerma WITH (NOLOCK) ${mermaWhere}) as pesoMermas
  `)

  return result.recordset[0]
}
