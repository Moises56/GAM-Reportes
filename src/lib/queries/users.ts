import { getPool, sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function getUserByUsername(username: string) {
  const pool = await getPool()
  const result = await pool.request()
    .input("username", sql.NVarChar, username)
    .query(`
      SELECT AppUserId, Username, PasswordHash, Nombre, Role, Activo, FechaCreacion, UltimoAcceso
      FROM AppUser WITH (NOLOCK)
      WHERE Username = @username
    `)
  return result.recordset[0] || null
}

export async function validateUser(username: string, password: string) {
  const user = await getUserByUsername(username)
  if (!user || !user.Activo) return null

  const valid = await bcrypt.compare(password, user.PasswordHash)
  if (!valid) return null

  // Update last access
  const pool = await getPool()
  await pool.request()
    .input("id", sql.Int, user.AppUserId)
    .query("UPDATE AppUser SET UltimoAcceso = GETDATE() WHERE AppUserId = @id")

  return {
    id: user.AppUserId,
    username: user.Username,
    name: user.Nombre,
    role: user.Role,
  }
}

export async function getUsers() {
  const pool = await getPool()
  const result = await pool.request().query(`
    SELECT
      AppUserId as id,
      Username as username,
      Nombre as nombre,
      Role as role,
      Activo as activo,
      FechaCreacion as fechaCreacion,
      UltimoAcceso as ultimoAcceso
    FROM AppUser WITH (NOLOCK)
    ORDER BY AppUserId
  `)
  return result.recordset
}

export async function getUserById(id: number) {
  const pool = await getPool()
  const result = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT
        AppUserId as id,
        Username as username,
        Nombre as nombre,
        Role as role,
        Activo as activo,
        FechaCreacion as fechaCreacion,
        UltimoAcceso as ultimoAcceso
      FROM AppUser WITH (NOLOCK)
      WHERE AppUserId = @id
    `)
  return result.recordset[0] || null
}

export async function createUser(username: string, password: string, nombre: string, role: string) {
  const pool = await getPool()
  const hash = await bcrypt.hash(password, 10)

  const result = await pool.request()
    .input("username", sql.NVarChar, username)
    .input("hash", sql.NVarChar, hash)
    .input("nombre", sql.NVarChar, nombre)
    .input("role", sql.NVarChar, role)
    .query(`
      INSERT INTO AppUser (Username, PasswordHash, Nombre, Role)
      OUTPUT INSERTED.AppUserId as id
      VALUES (@username, @hash, @nombre, @role)
    `)
  return result.recordset[0]
}

export async function updateUser(id: number, data: { nombre?: string; role?: string; activo?: boolean }) {
  const pool = await getPool()
  const sets: string[] = []
  const request = pool.request().input("id", sql.Int, id)

  if (data.nombre !== undefined) {
    sets.push("Nombre = @nombre")
    request.input("nombre", sql.NVarChar, data.nombre)
  }
  if (data.role !== undefined) {
    sets.push("Role = @role")
    request.input("role", sql.NVarChar, data.role)
  }
  if (data.activo !== undefined) {
    sets.push("Activo = @activo")
    request.input("activo", sql.Bit, data.activo)
  }

  if (sets.length === 0) return null

  await request.query(`UPDATE AppUser SET ${sets.join(", ")} WHERE AppUserId = @id`)
  return getUserById(id)
}

export async function changePassword(id: number, newPassword: string) {
  const pool = await getPool()
  const hash = await bcrypt.hash(newPassword, 10)

  await pool.request()
    .input("id", sql.Int, id)
    .input("hash", sql.NVarChar, hash)
    .query("UPDATE AppUser SET PasswordHash = @hash WHERE AppUserId = @id")

  return true
}
