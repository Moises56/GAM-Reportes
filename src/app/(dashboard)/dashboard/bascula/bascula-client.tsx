"use client"

import { Suspense } from "react"
import { DataTable } from "@/components/dashboard/data-table"
import { ReportFilters } from "@/components/dashboard/report-filters"
import { formatNumber, formatDate } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BasculaClientProps {
  pesajes: {
    data: Record<string, unknown>[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

function PaginationControls({ pesajes }: { pesajes: BasculaClientProps["pesajes"] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-[11px] text-muted-foreground">
        Mostrando {((pesajes.page - 1) * pesajes.pageSize) + 1}-
        {Math.min(pesajes.page * pesajes.pageSize, pesajes.total)} de{" "}
        {formatNumber(pesajes.total)}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(pesajes.page - 1)}
          disabled={pesajes.page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 text-xs">
          {pesajes.page} / {pesajes.totalPages}
        </span>
        <button
          onClick={() => goToPage(pesajes.page + 1)}
          disabled={pesajes.page >= pesajes.totalPages}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function BasculaClient({ pesajes }: BasculaClientProps) {
  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <ReportFilters tipo="bascula" showExport />
      </Suspense>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Registros de Báscula</h3>
        <DataTable
          columns={[
            { key: "fecha", label: "Fecha", render: (v) => formatDate(v as string) },
            { key: "transportista", label: "Transportista" },
            { key: "placa", label: "Placa" },
            { key: "motorista", label: "Motorista" },
            { key: "procedencia", label: "Procedencia" },
            { key: "pesoBruto", label: "Bruto", align: "right", render: (v) => formatNumber(v as number) },
            { key: "tara", label: "Tara", align: "right", render: (v) => formatNumber(v as number) },
            { key: "pesoNeto", label: "Neto", align: "right", render: (v) => formatNumber(v as number) },
            { key: "contenedor", label: "Contenedor" },
            { key: "bolsas", label: "Bolsas", align: "right" },
          ]}
          data={pesajes.data}
        />
        <Suspense>
          <PaginationControls pesajes={pesajes} />
        </Suspense>
      </div>
    </>
  )
}
