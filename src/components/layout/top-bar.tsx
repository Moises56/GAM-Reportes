"use client"

import { Scale } from "lucide-react"

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <Scale className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-sm font-semibold">{title}</h1>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>AMDCGAM</span>
        <span className="text-border">|</span>
        <span>Base de Datos de Producción</span>
      </div>
    </header>
  )
}
