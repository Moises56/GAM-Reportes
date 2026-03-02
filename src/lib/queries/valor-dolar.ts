import { getPool, sql } from "@/lib/db"

export async function getValorDolarActual() {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT TOP 1
      ValorDolarId,
      ValorDolarFecha as fecha,
      ValorDolarPrecio as venta
    FROM ValorDolar WITH (NOLOCK)
    ORDER BY ValorDolarFecha DESC
  `)

  return result.recordset[0] || { venta: 25.0, fecha: new Date() }
}

export async function getValorDolarPorFecha(fecha: string) {
  const pool = await getPool()
  const result = await pool.request()
    .input("fecha", sql.Date, fecha)
    .query(`
      SELECT TOP 1
        ValorDolarPrecio as venta,
        ValorDolarFecha as fecha
      FROM ValorDolar WITH (NOLOCK)
      WHERE ValorDolarFecha <= @fecha
      ORDER BY ValorDolarFecha DESC
    `)

  return result.recordset[0] || { venta: 25.0 }
}

export async function getValorDolarHistorico() {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT
      ValorDolarFecha as fecha,
      ValorDolarPrecio as venta
    FROM ValorDolar WITH (NOLOCK)
    ORDER BY ValorDolarFecha
  `)

  return result.recordset
}
