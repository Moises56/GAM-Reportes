import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { getUserByUsername, changePassword } from "@/lib/queries/users"

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Contraseña actual y nueva son requeridas" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verify current password
    const dbUser = await getUserByUsername(user.username)
    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const bcrypt = await import("bcryptjs")
    const valid = await bcrypt.compare(currentPassword, dbUser.PasswordHash)
    if (!valid) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })
    }

    await changePassword(dbUser.AppUserId, newPassword)

    // Log password change
    try {
      const { insertLog } = await import("@/lib/queries/logs")
      await insertLog({ accion: "Cambiar contraseña propia", usuario: user.username, modulo: "auth" })
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, message: "Contraseña actualizada" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Error al cambiar contraseña" }, { status: 500 })
  }
}
