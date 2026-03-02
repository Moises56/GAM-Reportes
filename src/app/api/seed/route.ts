import { NextResponse } from "next/server"
import { getPool, sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const pool = await getPool()

    // Create table if not exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppUser')
      BEGIN
        CREATE TABLE AppUser (
          AppUserId INT IDENTITY(1,1) PRIMARY KEY,
          Username NVARCHAR(50) NOT NULL UNIQUE,
          PasswordHash NVARCHAR(200) NOT NULL,
          Nombre NVARCHAR(100) NOT NULL,
          Role NVARCHAR(20) NOT NULL DEFAULT 'operador',
          Activo BIT NOT NULL DEFAULT 1,
          FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
          UltimoAcceso DATETIME NULL
        )
      END
    `)

    // Seed users
    const users = [
      { username: "admin", password: "admin123", nombre: "Administrador", role: "admin" },
      { username: "operador", password: "oper123", nombre: "Operador GAM", role: "operador" },
    ]

    const results = []

    for (const u of users) {
      const existing = await pool.request()
        .input("username", sql.NVarChar, u.username)
        .query("SELECT AppUserId FROM AppUser WHERE Username = @username")

      if (existing.recordset.length > 0) {
        // Update password hash for existing user
        const hash = await bcrypt.hash(u.password, 10)
        await pool.request()
          .input("username", sql.NVarChar, u.username)
          .input("hash", sql.NVarChar, hash)
          .query("UPDATE AppUser SET PasswordHash = @hash WHERE Username = @username")
        results.push({ username: u.username, action: "updated" })
      } else {
        const hash = await bcrypt.hash(u.password, 10)
        await pool.request()
          .input("username", sql.NVarChar, u.username)
          .input("hash", sql.NVarChar, hash)
          .input("nombre", sql.NVarChar, u.nombre)
          .input("role", sql.NVarChar, u.role)
          .query(`
            INSERT INTO AppUser (Username, PasswordHash, Nombre, Role)
            VALUES (@username, @hash, @nombre, @role)
          `)
        results.push({ username: u.username, action: "created" })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 })
  }
}
