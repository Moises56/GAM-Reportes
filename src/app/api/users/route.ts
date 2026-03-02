import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { getUsers, createUser } from "@/lib/queries/users"

export async function GET() {
  try {
    const user = await getUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Users GET error:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { username, password, nombre, role } = body

    if (!username || !password || !nombre || !role) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (!["admin", "operador", "auditor"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    const result = await createUser(username, password, nombre, role)

    // Log user creation
    try {
      const { insertLog } = await import("@/lib/queries/logs")
      await insertLog({ accion: "Crear usuario", detalle: `Usuario: ${username}, Rol: ${role}`, usuario: user.username, modulo: "usuarios" })
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.includes("UNIQUE") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "El nombre de usuario ya existe" }, { status: 409 })
    }
    console.error("Users POST error:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
