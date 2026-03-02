"use client"

import { Suspense } from "react"
import { DateRangePicker } from "./date-range-picker"
import { TransportistaSelector } from "./transportista-selector"
import { ExportButton } from "./export-button"
import { X } from "lucide-react"
import { useFilters } from "@/hooks/use-filters"

interface ReportFiltersProps {
  tipo: string
  showTurno?: boolean
  showExport?: boolean
}

function FiltersContent({ tipo, showTurno, showExport }: ReportFiltersProps) {
  const { turno, setFilter, clearFilters } = useFilters()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker />
      <TransportistaSelector />
      {showTurno && (
        <select
          value={turno || ""}
          onChange={(e) => setFilter("turno", e.target.value || undefined)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todos los turnos</option>
          <option value="DIURNO">Diurno</option>
          <option value="NOCTURNO">Nocturno</option>
        </select>
      )}
      <button
        onClick={clearFilters}
        className="flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground hover:bg-muted"
      >
        <X className="h-3 w-3" />
        Limpiar
      </button>
      {showExport && <ExportButton tipo={tipo} />}
    </div>
  )
}

export function ReportFilters(props: ReportFiltersProps) {
  return (
    <Suspense fallback={<div className="h-8" />}>
      <FiltersContent {...props} />
    </Suspense>
  )
}
