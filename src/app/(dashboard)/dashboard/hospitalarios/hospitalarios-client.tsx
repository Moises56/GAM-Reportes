"use client"

import { Suspense } from "react"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { DataTable } from "@/components/dashboard/data-table"
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { useFilters } from "@/hooks/use-filters"

interface PaginatedData {
  data: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface HospitalariosClientProps {
  facturacionMensual: Record<string, unknown>[]
  distribucion: { name: string; value: number }[]
  categoriasList: { id: number; nombre: string }[]
  establecimientos: PaginatedData
  facturas: PaginatedData
  gestores: Record<string, unknown>[]
}

function HospFilters({ categoriasList }: { categoriasList: { id: number; nombre: string }[] }) {
  const { getFilter, setFilter, clearFilters } = useFilters()
  const categoriaId = getFilter("categoriaId")

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker />
      <select
        value={categoriaId || ""}
        onChange={(e) => setFilter("categoriaId", e.target.value || undefined)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Todas las categorías</option>
        {categoriasList.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
      <button
        onClick={clearFilters}
        className="flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground hover:bg-muted"
      >
        <X className="h-3 w-3" />
        Limpiar
      </button>
    </div>
  )
}

function PaginationControls({ paginatedData }: { paginatedData: PaginatedData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`?${params.toString()}`)
  }

  if (paginatedData.total === 0) return null

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-[11px] text-muted-foreground">
        Mostrando {((paginatedData.page - 1) * paginatedData.pageSize) + 1}-
        {Math.min(paginatedData.page * paginatedData.pageSize, paginatedData.total)} de{" "}
        {formatNumber(paginatedData.total)}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(paginatedData.page - 1)}
          disabled={paginatedData.page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 text-xs">
          {paginatedData.page} / {paginatedData.totalPages}
        </span>
        <button
          onClick={() => goToPage(paginatedData.page + 1)}
          disabled={paginatedData.page >= paginatedData.totalPages}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function HospitalariosClient({
  facturacionMensual,
  distribucion,
  categoriasList,
  establecimientos,
  facturas,
  gestores,
}: HospitalariosClientProps) {
  return (
    <>
      {/* Filters */}
      <Suspense fallback={<div className="h-8" />}>
        <HospFilters categoriasList={categoriasList} />
      </Suspense>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Facturación Mensual (L)</h3>
          <BarChart
            data={facturacionMensual}
            xKey="mes"
            series={[
              { key: "monto", name: "Monto (L)", color: "#8b5cf6" },
            ]}
            height={280}
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Generadores por Categoría</h3>
          <PieChart
            data={distribucion}
            height={280}
          />
        </div>
      </div>

      {/* Table: Establecimientos (Generadores) */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">
          Generadores Registrados
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({formatNumber(establecimientos.total)} establecimientos)
          </span>
        </h3>
        <DataTable
          columns={[
            { key: "codigo", label: "Código" },
            { key: "nombre", label: "Nombre" },
            { key: "categoria", label: "Categoría" },
            { key: "rtn", label: "RTN" },
            { key: "precioTon", label: "Precio/Ton", align: "right", render: (v) => v ? formatCurrency(v as number, "HNL") : "—" },
          ]}
          data={establecimientos.data}
        />
        <Suspense>
          <PaginationControls paginatedData={establecimientos} />
        </Suspense>
      </div>

      {/* Table: Facturas Recientes */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Facturas Recientes</h3>
        <DataTable
          columns={[
            { key: "codigo", label: "Código" },
            { key: "fecha", label: "Fecha", render: (v) => v ? formatDate(v as string) : "—" },
            { key: "establecimiento", label: "Establecimiento" },
            { key: "categoria", label: "Categoría" },
            { key: "toneladas", label: "Toneladas", align: "right", render: (v) => v != null ? formatNumber(v as number, 4) : "—" },
            { key: "monto", label: "Monto (L)", align: "right", render: (v) => v != null ? formatCurrency(v as number, "HNL") : "—" },
          ]}
          data={facturas.data}
        />
      </div>

      {/* Table: Gestores (Recolectores) */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">
          Gestores de Recolección
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (Empresas que transportan desechos hospitalarios)
          </span>
        </h3>
        <DataTable
          columns={[
            { key: "nombre", label: "Empresa" },
            { key: "encargado", label: "Encargado" },
            { key: "telefono", label: "Teléfono" },
            { key: "vehiculos", label: "Vehículos", align: "right", render: (v) => formatNumber(v as number) },
            { key: "viajes", label: "Viajes (Báscula)", align: "right", render: (v) => formatNumber(v as number) },
          ]}
          data={gestores}
        />
      </div>
    </>
  )
}
