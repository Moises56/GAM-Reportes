import { NextResponse } from "next/server"
import { authenticate } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 })
    }

    const result = await authenticate(username, password)

    if (!result) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const response = NextResponse.json({ user: result.user })
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
