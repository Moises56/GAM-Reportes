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
  ChevronLeft,
  ChevronRight,
  LogOut,
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
}

interface SidebarProps {
  user: { name: string; role: string }
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
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
            if ("adminOnly" in item && item.adminOnly) {
              return user.role === "admin"
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
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

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
