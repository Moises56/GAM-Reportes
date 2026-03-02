import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { updateUser, changePassword } from "@/lib/queries/users"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const userId = Number(id)
    const body = await request.json()

    // Handle password change
    if (body.newPassword) {
      await changePassword(userId, body.newPassword)
      try {
        const { insertLog } = await import("@/lib/queries/logs")
        await insertLog({ accion: "Cambiar contraseña (admin)", detalle: `Usuario ID: ${userId}`, usuario: user.username, modulo: "usuarios" })
      } catch { /* ignore */ }
      return NextResponse.json({ success: true, message: "Contraseña actualizada" })
    }

    // Handle profile update
    const data: { nombre?: string; role?: string; activo?: boolean } = {}
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.role !== undefined) {
      if (!["admin", "operador", "auditor"].includes(body.role)) {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
      }
      data.role = body.role
    }
    if (body.activo !== undefined) data.activo = body.activo

    const updated = await updateUser(userId, data)

    // Log the action
    try {
      const { insertLog } = await import("@/lib/queries/logs")
      const changes = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ")
      const accion = data.activo !== undefined ? (data.activo ? "Activar usuario" : "Desactivar usuario") : "Editar usuario"
      await insertLog({ accion, detalle: `Usuario ID: ${userId}, ${changes}`, usuario: user.username, modulo: "usuarios" })
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("Users PUT error:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const userId = Number(id)

    // Soft delete: deactivate instead of remove
    await updateUser(userId, { activo: false })
    return NextResponse.json({ success: true, message: "Usuario desactivado" })
  } catch (error) {
    console.error("Users DELETE error:", error)
    return NextResponse.json({ error: "Error al desactivar usuario" }, { status: 500 })
  }
}
