"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Credenciales inválidas")
        setLoading(false)
        return
      }

      window.location.href = "/dashboard/overview"
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo AMDC */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/LOGO-AMDC.png"
            alt="AMDC"
            width={80}
            height={80}
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">GAM Reportes</h1>
            <p className="text-sm text-muted-foreground">Gestión Ambiental Municipal - AMDC</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </div>

          <div className="mt-4 text-center text-[11px] text-muted-foreground">
            Sistema de Reportes &bull; Gestión Ambiental Municipal
          </div>
        </form>
      </div>
    </div>
  )
}
