import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

// Fallback hardcoded users for when AppUser table doesn't exist yet
const FALLBACK_USERS = [
  { username: "admin", password: "admin123", name: "Administrador", role: "admin" },
  { username: "operador", password: "oper123", name: "Operador GAM", role: "operador" },
] as const

export async function authenticate(username: string, password: string, ip?: string) {
  // Dynamic import to avoid pulling bcryptjs into layout bundle
  try {
    const { validateUser } = await import("@/lib/queries/users")
    const user = await validateUser(username, password)
    if (user) {
      const token = await new SignJWT({ username: user.username, name: user.name, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("8h")
        .setIssuedAt()
        .sign(secret)

      // Log successful login
      try {
        const { insertLog } = await import("@/lib/queries/logs")
        await insertLog({ accion: "Inicio de sesión", usuario: user.username, ip, modulo: "auth" })
      } catch { /* ignore log errors */ }

      return { token, user: { username: user.username, name: user.name, role: user.role } }
    }

    // Log failed login attempt
    try {
      const { insertLog } = await import("@/lib/queries/logs")
      await insertLog({ accion: "Intento de login fallido", detalle: `Usuario: ${username}`, usuario: username, ip, modulo: "auth" })
    } catch { /* ignore log errors */ }
  } catch {
    // AppUser table might not exist yet, fall through to hardcoded
  }

  // Fallback to hardcoded users
  const fallback = FALLBACK_USERS.find((u) => u.username === username && u.password === password)
  if (!fallback) return null

  const token = await new SignJWT({ username: fallback.username, name: fallback.name, role: fallback.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .setIssuedAt()
    .sign(secret)

  return { token, user: { username: fallback.username, name: fallback.name, role: fallback.role } }
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { username: string; name: string; role: string }
  } catch {
    return null
  }
}

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
