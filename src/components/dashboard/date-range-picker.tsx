"use client"

import { useFilters } from "@/hooks/use-filters"
import { Calendar } from "lucide-react"

export function DateRangePicker() {
  const { fechaInicio, fechaFin, setFilters } = useFilters()

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <input
        type="date"
        value={fechaInicio || ""}
        onChange={(e) => setFilters({ fechaInicio: e.target.value || undefined })}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
        placeholder="Desde"
      />
      <span className="text-xs text-muted-foreground">a</span>
      <input
        type="date"
        value={fechaFin || ""}
        onChange={(e) => setFilters({ fechaFin: e.target.value || undefined })}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
        placeholder="Hasta"
      />
    </div>
  )
}
