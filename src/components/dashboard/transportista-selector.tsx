"use client"

import { useFilters } from "@/hooks/use-filters"
import { TRANSPORTISTA } from "@/lib/constants"

export function TransportistaSelector() {
  const { transportistaId, setFilter } = useFilters()

  return (
    <select
      value={transportistaId || ""}
      onChange={(e) => setFilter("transportistaId", e.target.value || undefined)}
      className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
    >
      <option value="">Todos los transportistas</option>
      <option value={String(TRANSPORTISTA.AMAHSA.id)}>AMAHSA</option>
      <option value={String(TRANSPORTISTA.COSEMSA.id)}>COSEMSA</option>
      <option value={String(TRANSPORTISTA.AMDC.id)}>AMDC</option>
      <option value={String(TRANSPORTISTA.PARTICULARES.id)}>PARTICULARES</option>
    </select>
  )
}
