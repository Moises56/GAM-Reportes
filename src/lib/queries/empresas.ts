import { getPool, sql } from "@/lib/db"

interface EmpresasFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
  search?: string
}

function buildConditions(
  request: ReturnType<Awaited<ReturnType<typeof getPool>>["request"]>,
  filters: EmpresasFilters
) {
  // Only AMAHSA (2) and COSEMSA (1)
  const conditions = ["bp.TransportistaId IN (1, 2)"]

  if (filters.fechaInicio) {
    conditions.push("bp.BoletaPesoFecha >= @fechaInicio")
    request.input("fechaInicio", sql.Date, filters.fechaInicio)
  }
  if (filters.fechaFin) {
    conditions.push("bp.BoletaPesoFecha <= @fechaFin")
    request.input("fechaFin", sql.Date, filters.fechaFin)
  }
  if (filters.transportistaId) {
    conditions.push("bp.TransportistaId = @transportistaId")
    request.input("transportistaId", sql.Int, filters.transportistaId)
  }
  if (filters.search) {
    conditions.push(
      "(bp.BoletaPesoCodigo LIKE @search OR RTRIM(bp.BoletaPesoMotorista) LIKE @search OR v.VehiculoPlaca LIKE @search OR v.VehiculoUnidad LIKE @search)"
    )
    request.input("search", sql.NVarChar, `%${filters.search}%`)
  }

  return conditions.join(" AND ")
}

export async function getEmpresasKPIs(filters: EmpresasFilters = {}) {
  const pool = await getPool()
  const request = pool.request()
  const where = buildConditions(request, filters)

  const result = await request.query(`
    SELECT
      COUNT(*) as totalBoletas,
      SUM(bp.BoletaPesoPesajeBruto - bp.BoletaPesoPesajeTara) as pesoNetoTotal,
      AVG(bp.BoletaPesoPesajeBruto - bp.BoletaPesoPesajeTara) as promedioNeto,
      COUNT(DISTINCT bp.VehiculoId) as unidadesActivas,
      COUNT(CASE WHEN bp.TransportistaId = 2 THEN 1 END) as boletasAmahsa,
      COUNT(CASE WHEN bp.TransportistaId = 1 THEN 1 END) as boletasCosemsa,
      SUM(CASE WHEN bp.TransportistaId = 2 THEN (bp.BoletaPesoPesajeBruto - bp.BoletaPesoPesajeTara) ELSE 0 END) as netoAmahsa,
      SUM(CASE WHEN bp.TransportistaId = 1 THEN (bp.BoletaPesoPesajeBruto - bp.BoletaPesoPesajeTara) ELSE 0 END) as netoCosemsa
    FROM BoletaPeso bp WITH (NOLOCK)
    LEFT JOIN TransportistaVehiculo v WITH (NOLOCK) ON bp.VehiculoId = v.VehiculoId AND bp.TransportistaId = v.TransportistaId
    WHERE ${where}
  `)

  return result.recordset[0]
}

export async function getEmpresasBoletas(
  filters: EmpresasFilters = {},
  page = 1,
  pageSize = 50
) {
  const pool = await getPool()
  const request = pool.request()
  const where = buildConditions(request, filters)
  const offset = (page - 1) * pageSize

  const result = await request.query(`
    SELECT
      bp.BoletaPesoFecha as fecha,
      bp.BoletaPesoHora as hora,
      RTRIM(v.VehiculoUnidad) as unidad,
      t.TransportistaNombre as transportista,
      bp.TransportistaId as transportistaId,
      RTRIM(bp.BoletaPesoMotorista) as motorista,
      RTRIM(v.VehiculoPlaca) as placa,
      r.RutasCodigo as codigoRuta,
      bp.ColoniasRecolectadas as procedencia,
      bp.BoletaPesoPesajeBruto as pesoBruto,
      bp.BoletaPesoPesajeTara as pesoTara,
      (bp.BoletaPesoPesajeBruto - bp.BoletaPesoPesajeTara) as pesoNeto,
      bp.BoletaPesoPesajeId as noBoleta,
      bp.BoletaPesoCodigo as boletaPeso,
      bp.BoletaPesoPesador as pesador,
      bp.BoletaPesoObservacion as observacion
    FROM BoletaPeso bp WITH (NOLOCK)
    JOIN Transportista t WITH (NOLOCK) ON bp.TransportistaId = t.TransportistaId
    LEFT JOIN TransportistaVehiculo v WITH (NOLOCK) ON bp.VehiculoId = v.VehiculoId AND bp.TransportistaId = v.TransportistaId
    LEFT JOIN Rutas r WITH (NOLOCK) ON bp.RutasId = r.RutasId
    WHERE ${where}
    ORDER BY bp.BoletaPesoFecha DESC, bp.BoletaPesoHora DESC
    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
  `)

  const countReq = pool.request()
  const countWhere = buildConditions(countReq, filters)
  const countResult = await countReq.query(`
    SELECT COUNT(*) as total
    FROM BoletaPeso bp WITH (NOLOCK)
    LEFT JOIN TransportistaVehiculo v WITH (NOLOCK) ON bp.VehiculoId = v.VehiculoId AND bp.TransportistaId = v.TransportistaId
    WHERE ${countWhere}
  `)

  return {
    data: result.recordset,
    total: countResult.recordset[0].total,
    page,
    pageSize,
    totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
  }
}
