import { getPool, sql } from "@/lib/db"

interface BoletaFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
  turno?: string
  rutaId?: number
  tipoBasuraId?: number
  temporada?: string
}

function buildWhereClause(filters: BoletaFilters) {
  const conditions: string[] = []
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
    conditions.push("TransportistaNombre = @transportista")
    const names: Record<number, string> = { 1: "AMAHSA", 2: "COSEMSA", 3: "AMDC", 4: "PARTICULARES" }
    params.push({ name: "transportista", type: sql.NVarChar, value: names[filters.transportistaId] || "" })
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  return { where, params }
}

export async function getBoletasKPIs(filters: BoletaFilters = {}) {
  const pool = await getPool()
  const { where, params } = buildWhereClause(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT
      COUNT(*) as totalBoletas,
      SUM(PESONETO) as pesoNetoTotal,
      AVG(PESONETO) as promedioViaje,
      COUNT(DISTINCT VehiculoPlaca) as vehiculosActivos
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where}
  `)
  return result.recordset[0]
}

export async function getBoletasTendenciaMensual(filters: BoletaFilters = {}) {
  const pool = await getPool()
  const { where, params } = buildWhereClause(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT
      CONVERT(char(7), BoletaPesoFecha, 126) as mes,
      TransportistaNombre as transportista,
      COUNT(*) as boletas,
      SUM(PESONETO) as pesoNeto
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where}
    GROUP BY CONVERT(char(7), BoletaPesoFecha, 126), TransportistaNombre
    ORDER BY mes
  `)
  return result.recordset
}

export async function getBoletasDistribucionTransportista(filters: BoletaFilters = {}) {
  const pool = await getPool()
  const { where, params } = buildWhereClause(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT
      TransportistaNombre as name,
      COUNT(*) as boletas,
      SUM(PESONETO) as pesoNeto
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where}
    GROUP BY TransportistaNombre
    ORDER BY pesoNeto DESC
  `)
  return result.recordset
}

export async function getBoletasRecientes(limit = 10) {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT TOP ${limit}
      BoletaPesoCodigo as codigo,
      BoletaPesoFecha as fecha,
      TransportistaNombre as transportista,
      VehiculoPlaca as placa,
      RutasCodigo as ruta,
      BoletaPesoPesajeBruto as pesoBruto,
      VehiculoTara as tara,
      PESONETO as pesoNeto
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ORDER BY BoletaPesoFecha DESC
  `)
  return result.recordset
}

export async function getBoletasTopRutas(filters: BoletaFilters = {}, limit = 20) {
  const pool = await getPool()
  const { where, params } = buildWhereClause(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT TOP ${limit}
      RutasCodigo as ruta,
      TransportistaNombre as transportista,
      COUNT(*) as viajes,
      SUM(PESONETO) as pesoNeto
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where ? where + " AND RutasCodigo IS NOT NULL" : "WHERE RutasCodigo IS NOT NULL"}
    GROUP BY RutasCodigo, TransportistaNombre
    ORDER BY pesoNeto DESC
  `)
  return result.recordset
}

export async function getBoletasPaginadas(
  filters: BoletaFilters = {},
  page = 1,
  pageSize = 50,
  sortBy = "BoletaPesoFecha",
  sortDir: "asc" | "desc" = "desc"
) {
  const pool = await getPool()
  const { where, params } = buildWhereClause(filters)

  // Uses vw_BoletaPesoDetalleIndexed for BOTH data and count
  // This view contains 92,223 rows (AMAHSA + COSEMSA active boletas)
  const allowedSorts: Record<string, string> = {
    fecha: "BoletaPesoFecha",
    transportista: "TransportistaNombre",
    pesoNeto: "PESONETO",
    ruta: "RutasCodigo",
    BoletaPesoFecha: "BoletaPesoFecha",
  }
  const orderCol = allowedSorts[sortBy] || "BoletaPesoFecha"
  const dir = sortDir === "asc" ? "ASC" : "DESC"
  const offset = (page - 1) * pageSize

  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const dataResult = await request.query(`
    SELECT
      BoletaPesoCodigo as codigo,
      BoletaPesoFecha as fecha,
      TransportistaNombre as transportista,
      VehiculoPlaca as placa,
      RutasCodigo as ruta,
      BoletaPesoPesajeBruto as pesoBruto,
      VehiculoTara as tara,
      PESONETO as pesoNeto
    FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
    ${where}
    ORDER BY ${orderCol} ${dir}
    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
  `)

  const countReq = pool.request()
  params.forEach((p) => countReq.input(p.name, p.type, p.value))
  const countRes = await countReq.query(`
    SELECT COUNT(*) as total FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK) ${where}
  `)

  return {
    data: dataResult.recordset,
    total: countRes.recordset[0].total,
    page,
    pageSize,
    totalPages: Math.ceil(countRes.recordset[0].total / pageSize),
  }
}
