"use client"

import { Suspense } from "react"
import { DataTable } from "@/components/dashboard/data-table"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { formatNumber, formatDate, formatCurrency } from "@/lib/utils"

interface MultasClientProps {
  multas: Record<string, unknown>[]
  mermas: Record<string, unknown>[]
}

export function MultasClient({ multas, mermas }: MultasClientProps) {
  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="multas" showExport />
      </Suspense>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Multas Formales</h3>
        <DataTable
          columns={[
            { key: "fecha", label: "Fecha", render: (v) => formatDate(v as string) },
            { key: "transportista", label: "Transportista" },
            { key: "memorandum", label: "Memorandum" },
            { key: "tipoIncumplimiento", label: "Tipo Incumplimiento" },
            { key: "monto", label: "Monto (L)", align: "right", render: (v) => formatCurrency(v as number, "HNL") },
          ]}
          data={multas}
          emptyMessage="No hay multas registradas"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Reportes de Merma</h3>
        <DataTable
          columns={[
            { key: "fecha", label: "Fecha", render: (v) => formatDate(v as string) },
            { key: "transportista", label: "Transportista" },
            { key: "peso", label: "Peso (lbs)", align: "right", render: (v) => formatNumber(v as number) },
            { key: "observacion", label: "Observación" },
          ]}
          data={mermas}
          emptyMessage="No hay mermas registradas"
        />
      </div>
    </>
  )
}
