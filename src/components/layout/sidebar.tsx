"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/constants"
import {
  LayoutDashboard,
  Weight,
  Receipt,
  Truck,
  Route,
  AlertTriangle,
  ArrowLeftRight,
  Scale,
  Hospital,
  Users,
  ScrollText,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  KeyRound,
  Loader2,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Weight,
  Receipt,
  Truck,
  Route,
  AlertTriangle,
  ArrowLeftRight,
  Scale,
  Hospital,
  Users,
  ScrollText,
  Building2,
}

interface SidebarProps {
  user: { name: string; role: string }
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showPwdDialog, setShowPwdDialog] = useState(false)
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState("")
  const [pwdSuccess, setPwdSuccess] = useState("")
  const pathname = usePathname()

  const handleLogout = async () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
  }

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError("")
    setPwdSuccess("")
    if (newPwd !== confirmPwd) {
      setPwdError("Las contraseñas no coinciden")
      return
    }
    setPwdLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwdError(data.error || "Error al cambiar contraseña")
      } else {
        setPwdSuccess("Contraseña actualizada correctamente")
        setCurrentPwd("")
        setNewPwd("")
        setConfirmPwd("")
        setTimeout(() => { setShowPwdDialog(false); setPwdSuccess("") }, 1500)
      }
    } catch {
      setPwdError("Error de conexión")
    }
    setPwdLoading(false)
  }

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <Image
          src="/LOGO-AMDC.png"
          alt="AMDC"
          width={36}
          height={36}
          className="shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">GAM Reportes</span>
            <span className="text-[10px] text-muted-foreground">AMDC</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">
          {NAV_ITEMS.filter((item) => {
            // gam-empresas can only see Overview and Empresas
            if (user.role === "gam-empresas") {
              return item.href === "/dashboard/overview" || item.href === "/dashboard/empresas"
            }
            if ("adminOnly" in item && item.adminOnly) {
              return user.role === "admin"
            }
            if ("roles" in item && item.roles) {
              return (item.roles as readonly string[]).includes(user.role)
            }
            return true
          }).map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium border-l-[3px] border-primary -ml-[3px]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {Icon && <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => { setShowPwdDialog(true); setPwdError(""); setPwdSuccess(""); setCurrentPwd(""); setNewPwd(""); setConfirmPwd("") }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Cambiar Contraseña"
        >
          <KeyRound className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cambiar Contraseña</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Password Change Dialog */}
      {showPwdDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPwdDialog(false)}>
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-base font-semibold">Cambiar Contraseña</h3>
            <p className="mb-4 text-sm text-muted-foreground">Ingrese su contraseña actual y la nueva</p>
            <form onSubmit={handleChangePwd} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Contraseña Actual</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                  minLength={6}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {pwdError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{pwdError}</p>}
              {pwdSuccess && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">{pwdSuccess}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPwdDialog(false)} className="flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-muted">
                  Cancelar
                </button>
                <button type="submit" disabled={pwdLoading} className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {pwdLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cambiar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
