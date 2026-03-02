import { getPool, sql } from "@/lib/db"

export interface LogEntry {
  accion: string
  detalle?: string
  usuario: string
  ip?: string
  modulo?: string
}

export async function insertLog(entry: LogEntry) {
  try {
    const pool = await getPool()
    await pool.request()
      .input("accion", sql.NVarChar, entry.accion)
      .input("detalle", sql.NVarChar, entry.detalle || null)
      .input("usuario", sql.NVarChar, entry.usuario)
      .input("ip", sql.NVarChar, entry.ip || null)
      .input("modulo", sql.NVarChar, entry.modulo || null)
      .query(`
        INSERT INTO AppLog (Accion, Detalle, Usuario, IP, Modulo)
        VALUES (@accion, @detalle, @usuario, @ip, @modulo)
      `)
  } catch (error) {
    // Log errors should not break app functionality
    console.error("Error inserting log:", error)
  }
}

interface LogFilters {
  fechaInicio?: string
  fechaFin?: string
  usuario?: string
  modulo?: string
  accion?: string
}

export async function getLogs(
  filters: LogFilters = {},
  page = 1,
  pageSize = 50
) {
  const pool = await getPool()
  const conditions: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: { name: string; type: any; value: unknown }[] = []

  if (filters.fechaInicio) {
    conditions.push("Fecha >= @fechaInicio")
    params.push({ name: "fechaInicio", type: sql.DateTime, value: filters.fechaInicio })
  }
  if (filters.fechaFin) {
    conditions.push("Fecha <= @fechaFin")
    params.push({ name: "fechaFin", type: sql.DateTime, value: new Date(new Date(filters.fechaFin).getTime() + 86400000) })
  }
  if (filters.usuario) {
    conditions.push("Usuario = @usuario")
    params.push({ name: "usuario", type: sql.NVarChar, value: filters.usuario })
  }
  if (filters.modulo) {
    conditions.push("Modulo = @modulo")
    params.push({ name: "modulo", type: sql.NVarChar, value: filters.modulo })
  }
  if (filters.accion) {
    conditions.push("Accion LIKE @accion")
    params.push({ name: "accion", type: sql.NVarChar, value: `%${filters.accion}%` })
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  const offset = (page - 1) * pageSize

  const dataReq = pool.request()
  params.forEach((p) => dataReq.input(p.name, p.type, p.value))

  const dataResult = await dataReq.query(`
    SELECT
      AppLogId as id,
      Accion as accion,
      Detalle as detalle,
      Usuario as usuario,
      IP as ip,
      Modulo as modulo,
      Fecha as fecha
    FROM AppLog WITH (NOLOCK)
    ${where}
    ORDER BY Fecha DESC
    OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
  `)

  const countReq = pool.request()
  params.forEach((p) => countReq.input(p.name, p.type, p.value))
  const countResult = await countReq.query(`
    SELECT COUNT(*) as total FROM AppLog WITH (NOLOCK) ${where}
  `)

  return {
    data: dataResult.recordset,
    total: countResult.recordset[0].total,
    page,
    pageSize,
    totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
  }
}

export async function getLogUsuarios() {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT DISTINCT Usuario as usuario
    FROM AppLog WITH (NOLOCK)
    ORDER BY Usuario
  `)
  return result.recordset.map((r: { usuario: string }) => r.usuario)
}

export async function getLogModulos() {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT DISTINCT Modulo as modulo
    FROM AppLog WITH (NOLOCK)
    WHERE Modulo IS NOT NULL
    ORDER BY Modulo
  `)
  return result.recordset.map((r: { modulo: string }) => r.modulo)
}
