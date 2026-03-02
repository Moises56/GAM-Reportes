import sql from "mssql"

const config: sql.config = {
  server: process.env.DB_SERVER || "GIS-MAVILES",
  database: process.env.DB_NAME || "AMDCGAM",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

const globalForDb = globalThis as unknown as {
  _sqlPool: Promise<sql.ConnectionPool> | undefined
}

export function getPool(): Promise<sql.ConnectionPool> {
  if (!globalForDb._sqlPool) {
    const pool = new sql.ConnectionPool(config)
    pool.on("error", (err) => {
      console.error("SQL Pool error:", err)
      globalForDb._sqlPool = undefined
    })
    globalForDb._sqlPool = pool.connect()
    globalForDb._sqlPool.catch(() => {
      globalForDb._sqlPool = undefined
    })
  }
  return globalForDb._sqlPool
}

export { sql }
