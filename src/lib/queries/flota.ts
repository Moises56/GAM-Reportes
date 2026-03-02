import { getPool, sql } from "@/lib/db"

interface FlotaFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
}

export async function getFlotaResumen(filters: FlotaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()

  // First aggregate boleta data from indexed view (fast)
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
    boletaConditions.push("b.TransportistaNombre = @transportista")
    request.input("transportista", sql.NVarChar, names[filters.transportistaId] || "")
  }

  const boletaWhere = boletaConditions.length > 0 ? `WHERE ${boletaConditions.join(" AND ")}` : ""

  const vehicleFilter = filters.transportistaId
    ? "WHERE tv.TransportistaId = @transportistaId"
    : ""
  if (filters.transportistaId) {
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const result = await request.query(`
    ;WITH BoletaStats AS (
      SELECT
        VehiculoPlaca,
        COUNT(*) as viajes,
        SUM(PESONETO) as pesoTotal,
        AVG(PESONETO) as promedioPorViaje
      FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)
      ${boletaWhere}
      GROUP BY VehiculoPlaca
    )
    SELECT
      tv.VehiculoId,
      tv.VehiculoUnidad as unidad,
      tv.VehiculoPlaca as placa,
      tv.VehiculoModelo as modelo,
      tv.VehiculoCapacidad as capacidad,
      tv.VehiculoTipoDeUnidad as tipo,
      t.TransportistaNombre as transportista,
      ISNULL(bs.viajes, 0) as viajes,
      ISNULL(bs.pesoTotal, 0) as pesoTotal,
      ISNULL(bs.promedioPorViaje, 0) as promedioPorViaje
    FROM TransportistaVehiculo tv WITH (NOLOCK)
    INNER JOIN Transportista t WITH (NOLOCK) ON tv.TransportistaId = t.TransportistaId
    LEFT JOIN BoletaStats bs ON tv.VehiculoPlaca = bs.VehiculoPlaca
    ${vehicleFilter}
    ORDER BY pesoTotal DESC
  `)

  return result.recordset
}

export async function getFlotaKPIs(filters: FlotaFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const conditions: string[] = []

  if (filters.transportistaId) {
    conditions.push("tv.TransportistaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const result = await request.query(`
    SELECT
      COUNT(*) as totalVehiculos,
      COUNT(CASE WHEN t.TransportistaNombre = 'AMAHSA' THEN 1 END) as vehiculosAmahsa,
      COUNT(CASE WHEN t.TransportistaNombre = 'COSEMSA' THEN 1 END) as vehiculosCosemsa
    FROM TransportistaVehiculo tv WITH (NOLOCK)
    INNER JOIN Transportista t WITH (NOLOCK) ON tv.TransportistaId = t.TransportistaId
    ${where}
  `)

  return result.recordset[0]
}
