import { getPool, sql } from "@/lib/db"

interface BasculaFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
}

export async function getBasculaKPIs(filters: BasculaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const conditions = ["bp.BasculaPstatus = 1"]

  if (filters.fechaInicio) {
    conditions.push("bp.BasculaPesajeFecha >= @fechaInicio")
    request.input("fechaInicio", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    conditions.push("bp.BasculaPesajeFecha <= @fechaFin")
    request.input("fechaFin", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    conditions.push("bp.TransportistaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const result = await request.query(`
    SELECT
      COUNT(*) as totalPesajes,
      SUM(bp.BasculaPesajePesoBruto) as pesoBrutoTotal,
      SUM(bp.BasculaPesajeTara) as taraTotal,
      SUM(bp.BasculaPesajePesoBruto - bp.BasculaPesajeTara) as pesoNetoTotal,
      AVG(bp.BasculaPesajePesoBruto - bp.BasculaPesajeTara) as promedioNeto,
      COUNT(DISTINCT bp.Placa) as vehiculosUnicos
    FROM BasculaPesaje bp WITH (NOLOCK)
    WHERE ${conditions.join(" AND ")}
  `)

  return result.recordset[0]
}

export async function getBasculaPaginada(
  filters: BasculaFilters = {},
  page = 1,
  pageSize = 50,
  sortBy = "BasculaPesajeFecha",
  sortDir: "asc" | "desc" = "desc"
) {
  const pool = await getPool()
  const request = pool.request()
  const conditions = ["bp.BasculaPstatus = 1"]

  if (filters.fechaInicio) {
    conditions.push("bp.BasculaPesajeFecha >= @fechaInicio")
    request.input("fechaInicio", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    conditions.push("bp.BasculaPesajeFecha <= @fechaFin")
    request.input("fechaFin", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    conditions.push("bp.TransportistaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const where = conditions.join(" AND ")
  const allowedSorts: Record<string, string> = {
    fecha: "bp.BasculaPesajeFecha",
    pesoBruto: "bp.BasculaPesajePesoBruto",
    tara: "bp.BasculaPesajeTara",
    BasculaPesajeFecha: "bp.BasculaPesajeFecha",
  }
  const orderCol = allowedSorts[sortBy] || "bp.BasculaPesajeFecha"
  const dir = sortDir === "asc" ? "ASC" : "DESC"
  const offset = (page - 1) * pageSize

  const result = await request.query(`
    SELECT
      bp.BasculaPId,
      bp.BasculaPesajeFecha as fecha,
      t.TransportistaNombre as transportista,
      bp.Placa as placa,
      bp.Motorista as motorista,
      bp.Procedencia as procedencia,
      bp.ColoniasNombres as colonias,
      bp.BasculaPesajePesoBruto as pesoBruto,
      bp.BasculaPesajeTara as tara,
      (bp.BasculaPesajePesoBruto - bp.BasculaPesajeTara) as pesoNeto,
      bp.BasTipoContenedor as contenedor,
      bp.BasCantidadBolsas as bolsas,
      bp.BasObservacion as observacion
    FROM BasculaPesaje bp WITH (NOLOCK)
    LEFT JOIN Transportista t WITH (NOLOCK) ON bp.TransportistaId = t.TransportistaId
    WHERE ${where}
    ORDER BY ${orderCol} ${dir}
    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
  `)

  const countReq = pool.request()
  if (filters.fechaInicio) countReq.input("fechaInicio", sql.Date, filters.fechaInicio)
  if (filters.fechaFin) countReq.input("fechaFin", sql.Date, filters.fechaFin)
  if (filters.transportistaId) countReq.input("transportistaId", sql.Int, filters.transportistaId)

  const countRes = await countReq.query(`SELECT COUNT(*) as total FROM BasculaPesaje bp WITH (NOLOCK) WHERE ${where}`)

  return {
    data: result.recordset,
    total: countRes.recordset[0].total,
    page,
    pageSize,
    totalPages: Math.ceil(countRes.recordset[0].total / pageSize),
  }
}
