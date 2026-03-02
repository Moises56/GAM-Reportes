import { getPool, sql } from "@/lib/db"

interface HospFilters {
  fechaInicio?: string
  fechaFin?: string
  categoriaId?: number
}

function buildFacturaWhereClause(filters: HospFilters) {
  const conditions: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: { name: string; type: any; value: unknown }[] = []

  if (filters.fechaInicio) {
    conditions.push("hf.HospFacturaFecha >= @fechaInicio")
    params.push({ name: "fechaInicio", type: sql.Date, value: filters.fechaInicio })
  }
  if (filters.fechaFin) {
    conditions.push("hf.HospFacturaFecha <= @fechaFin")
    params.push({ name: "fechaFin", type: sql.Date, value: filters.fechaFin })
  }
  if (filters.categoriaId) {
    conditions.push("h.CategoriaGenId = @categoriaId")
    params.push({ name: "categoriaId", type: sql.Int, value: filters.categoriaId })
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  return { where, params }
}

export async function getHospitalariosKPIs(filters: HospFilters = {}) {
  const pool = await getPool()
  const { where, params } = buildFacturaWhereClause(filters)
  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const result = await request.query(`
    SELECT
      COUNT(DISTINCT h.HospitalarioId) as totalEstablecimientos,
      ISNULL(SUM(d.DetalleFacturaMonto), 0) as totalFacturado,
      ISNULL(SUM(d.DetalleFacturaTon), 0) as totalToneladas,
      COUNT(DISTINCT hf.HospFacturaId) as totalFacturas
    FROM Hospitalario h WITH (NOLOCK)
    LEFT JOIN HospFactura hf WITH (NOLOCK) ON h.HospitalarioId = hf.HospitalarioId
    LEFT JOIN HospFacturaDetalleFactura d WITH (NOLOCK) ON hf.HospFacturaId = d.HospFacturaId
    ${where}
  `)
  return result.recordset[0]
}

export async function getHospFacturacionMensual(filters: HospFilters = {}) {
  const pool = await getPool()
  const request = pool.request()

  const conditions: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: { name: string; type: any; value: unknown }[] = []

  if (filters.fechaInicio) {
    conditions.push("hf.HospFacturaFecha >= @fechaInicio")
    params.push({ name: "fechaInicio", type: sql.Date, value: filters.fechaInicio })
  }
  if (filters.fechaFin) {
    conditions.push("hf.HospFacturaFecha <= @fechaFin")
    params.push({ name: "fechaFin", type: sql.Date, value: filters.fechaFin })
  }
  if (filters.categoriaId) {
    conditions.push("h.CategoriaGenId = @categoriaId")
    params.push({ name: "categoriaId", type: sql.Int, value: filters.categoriaId })
  }

  params.forEach((p) => request.input(p.name, p.type, p.value))
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const result = await request.query(`
    SELECT
      CONVERT(char(7), hf.HospFacturaFecha, 126) as mes,
      ISNULL(SUM(d.DetalleFacturaMonto), 0) as monto,
      ISNULL(SUM(d.DetalleFacturaTon), 0) as toneladas,
      COUNT(DISTINCT hf.HospFacturaId) as facturas
    FROM HospFactura hf WITH (NOLOCK)
    INNER JOIN Hospitalario h WITH (NOLOCK) ON hf.HospitalarioId = h.HospitalarioId
    INNER JOIN HospFacturaDetalleFactura d WITH (NOLOCK) ON hf.HospFacturaId = d.HospFacturaId
    ${where}
    GROUP BY CONVERT(char(7), hf.HospFacturaFecha, 126)
    ORDER BY mes
  `)
  return result.recordset
}

export async function getHospPorCategoria() {
  const pool = await getPool()

  const result = await pool.request().query(`
    SELECT
      RTRIM(c.CategoriaGenNombre) as name,
      COUNT(h.HospitalarioId) as value
    FROM CategoriaGen c WITH (NOLOCK)
    LEFT JOIN Hospitalario h WITH (NOLOCK) ON c.CategoriaGenId = h.CategoriaGenId
    GROUP BY c.CategoriaGenNombre
    HAVING COUNT(h.HospitalarioId) > 0
    ORDER BY value DESC
  `)
  return result.recordset
}

export async function getCategorias() {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT CategoriaGenId as id, RTRIM(CategoriaGenNombre) as nombre
    FROM CategoriaGen WITH (NOLOCK)
    ORDER BY CategoriaGenNombre
  `)
  return result.recordset as { id: number; nombre: string }[]
}

export async function getHospListado(
  filters: HospFilters = {},
  page = 1,
  pageSize = 50,
  sortBy = "HospitalarioNombre",
  sortDir: "asc" | "desc" = "asc"
) {
  const pool = await getPool()

  const allowedSorts: Record<string, string> = {
    nombre: "h.HospitalarioNombre",
    codigo: "h.HospitalarioCodigo",
    categoria: "c.CategoriaGenNombre",
    rtn: "h.HospitalarioRTN",
    precioTon: "h.HospitalarioPrecioTon",
    HospitalarioNombre: "h.HospitalarioNombre",
  }
  const orderCol = allowedSorts[sortBy] || "h.HospitalarioNombre"
  const dir = sortDir === "asc" ? "ASC" : "DESC"
  const offset = (page - 1) * pageSize

  const conditions: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: { name: string; type: any; value: unknown }[] = []

  if (filters.categoriaId) {
    conditions.push("h.CategoriaGenId = @categoriaId")
    params.push({ name: "categoriaId", type: sql.Int, value: filters.categoriaId })
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const dataResult = await request.query(`
    SELECT
      h.HospitalarioId as id,
      h.HospitalarioCodigo as codigo,
      RTRIM(h.HospitalarioNombre) as nombre,
      RTRIM(c.CategoriaGenNombre) as categoria,
      h.HospitalarioRTN as rtn,
      h.HospitalarioPrecioTon as precioTon
    FROM Hospitalario h WITH (NOLOCK)
    LEFT JOIN CategoriaGen c WITH (NOLOCK) ON h.CategoriaGenId = c.CategoriaGenId
    ${where}
    ORDER BY ${orderCol} ${dir}
    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
  `)

  const countReq = pool.request()
  params.forEach((p) => countReq.input(p.name, p.type, p.value))
  const countRes = await countReq.query(`
    SELECT COUNT(*) as total FROM Hospitalario h WITH (NOLOCK) ${where}
  `)

  return {
    data: dataResult.recordset,
    total: countRes.recordset[0].total,
    page,
    pageSize,
    totalPages: Math.ceil(countRes.recordset[0].total / pageSize),
  }
}

export async function getHospFacturas(
  filters: HospFilters = {},
  page = 1,
  pageSize = 50,
  sortBy = "HospFacturaFecha",
  sortDir: "asc" | "desc" = "desc"
) {
  const pool = await getPool()
  const { where, params } = buildFacturaWhereClause(filters)

  const allowedSorts: Record<string, string> = {
    fecha: "hf.HospFacturaFecha",
    establecimiento: "h.HospitalarioNombre",
    monto: "d.DetalleFacturaMonto",
    HospFacturaFecha: "hf.HospFacturaFecha",
  }
  const orderCol = allowedSorts[sortBy] || "hf.HospFacturaFecha"
  const dir = sortDir === "asc" ? "ASC" : "DESC"
  const offset = (page - 1) * pageSize

  const request = pool.request()
  params.forEach((p) => request.input(p.name, p.type, p.value))

  const dataResult = await request.query(`
    SELECT
      hf.HospFacturaId as id,
      hf.HospFacturaCodigo as codigo,
      hf.HospFacturaFecha as fecha,
      RTRIM(h.HospitalarioNombre) as establecimiento,
      RTRIM(c.CategoriaGenNombre) as categoria,
      d.DetalleFacturaTon as toneladas,
      d.DetalleFacturaMonto as monto,
      hf.HospFacturaEstado as estado
    FROM HospFactura hf WITH (NOLOCK)
    INNER JOIN Hospitalario h WITH (NOLOCK) ON hf.HospitalarioId = h.HospitalarioId
    LEFT JOIN CategoriaGen c WITH (NOLOCK) ON h.CategoriaGenId = c.CategoriaGenId
    LEFT JOIN HospFacturaDetalleFactura d WITH (NOLOCK) ON hf.HospFacturaId = d.HospFacturaId
    ${where}
    ORDER BY ${orderCol} ${dir}
    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
  `)

  const countReq = pool.request()
  params.forEach((p) => countReq.input(p.name, p.type, p.value))
  const countRes = await countReq.query(`
    SELECT COUNT(*) as total
    FROM HospFactura hf WITH (NOLOCK)
    INNER JOIN Hospitalario h WITH (NOLOCK) ON hf.HospitalarioId = h.HospitalarioId
    LEFT JOIN HospFacturaDetalleFactura d WITH (NOLOCK) ON hf.HospFacturaId = d.HospFacturaId
    ${where}
  `)

  return {
    data: dataResult.recordset,
    total: countRes.recordset[0].total,
    page,
    pageSize,
    totalPages: Math.ceil(countRes.recordset[0].total / pageSize),
  }
}

export async function getGestoresResumen() {
  const pool = await getPool()

  const result = await pool.request().query(`
    SELECT
      g.GestorId as id,
      g.GestorNombreEmpresa as nombre,
      g.GestorNombreEncargado as encargado,
      g.GestorTelefono as telefono,
      COUNT(DISTINCT gv.GVehiculoId) as vehiculos,
      COUNT(DISTINCT bp.BasculaPId) as viajes
    FROM Gestor g WITH (NOLOCK)
    LEFT JOIN GestorGVehiculo gv WITH (NOLOCK) ON g.GestorId = gv.GestorId
    LEFT JOIN BasculaPesaje bp WITH (NOLOCK) ON g.GestorId = bp.GestorId
    GROUP BY g.GestorId, g.GestorNombreEmpresa, g.GestorNombreEncargado, g.GestorTelefono
    ORDER BY viajes DESC
  `)
  return result.recordset
}
