import { getPool, sql } from "@/lib/db"

interface RutaFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
  turno?: string
}

export async function getRutasResumen(filters: RutaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()

  // Boleta conditions for indexed view
  const boletaConditions: string[] = []
  if (filters.fechaInicio) {
    boletaConditions.push("BoletaPesoFecha >= @fechaInicio")
    request.input("fechaInicio", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    boletaConditions.push("BoletaPesoFecha <= @fechaFin")
    request.input("fechaFin", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    const names: Record<number, string> = { 1: "AMAHSA", 2: "COSEMSA", 3: "AMDC", 4: "PARTICULARES" }
    boletaConditions.push("TransportistaNombre = @transportista")
    request.input("transportista", sql.NVarChar, names[filters.transportistaId] || "")
  }
  const boletaWhere = boletaConditions.length > 0 ? `WHERE ${boletaConditions.join(" AND ")}` : ""

  // Route-level filters
  const rutaConditions: string[] = []
  if (filters.turno) {
    rutaConditions.push("r.RutasTurno = @turno")
    request.input("turno", sql.NVarChar, filters.turno)
  }
  if (filters.transportistaId) {
    rutaConditions.push("r.RutaEmpresaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }
  const rutaWhere = rutaConditions.length > 0 ? `WHERE ${rutaConditions.join(" AND ")}` : ""

  const result = await request.query(`
    ;WITH BoletaByRuta AS (
      SELECT
        RutasCodigo,
        COUNT(*) as viajes,
        SUM(PESONETO) as pesoTotal
      FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
      ${boletaWhere}
      GROUP BY RutasCodigo
    ),
    ColoniaCounts AS (
      SELECT RutasId, COUNT(*) as colonias
      FROM RutasColonias WITH (NOLOCK)
      GROUP BY RutasId
    )
    SELECT
      r.RutasId,
      r.RutasCodigo as codigo,
      r.RutasTurno as turno,
      r.RutasFrecuencia as frecuencia,
      r.RutasNombreEmpresa as transportista,
      ISNULL(cc.colonias, 0) as colonias,
      ISNULL(br.viajes, 0) as viajes,
      ISNULL(br.pesoTotal, 0) as pesoTotal
    FROM Rutas r WITH (NOLOCK)
    LEFT JOIN BoletaByRuta br ON r.RutasCodigo = br.RutasCodigo
    LEFT JOIN ColoniaCounts cc ON r.RutasId = cc.RutasId
    ${rutaWhere}
    ORDER BY pesoTotal DESC
  `)

  return result.recordset
}

export async function getRutaColonias(rutaId: number) {
  const pool = await getPool()
  const result = await pool.request()
    .input("rutaId", sql.Int, rutaId)
    .query(`
      SELECT ColoniasNombre as ColoniaNombre
      FROM RutasColonias WITH (NOLOCK)
      WHERE RutasId = @rutaId
      ORDER BY ColoniasNombre
    `)

  return result.recordset
}

export async function getRutasKPIs(filters: RutaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const conditions: string[] = []

  if (filters.transportistaId) {
    conditions.push("RutaEmpresaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const result = await request.query(`
    SELECT
      (SELECT COUNT(*) FROM Rutas WITH (NOLOCK) ${where}) as totalRutas,
      (SELECT COUNT(*) FROM RutasColonias WITH (NOLOCK)) as totalColonias
  `)

  return result.recordset[0]
}
