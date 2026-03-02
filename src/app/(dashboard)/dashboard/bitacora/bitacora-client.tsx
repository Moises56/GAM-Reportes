"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatNumber } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { useFilters } from "@/hooks/use-filters"

interface PaginatedLogs {
  data: LogRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface LogRecord {
  id: number
  accion: string
  detalle: string | null
  usuario: string
  ip: string | null
  modulo: string | null
  fecha: string
}

interface BitacoraClientProps {
  logs: PaginatedLogs
  usuarios: string[]
  modulos: string[]
}

function LogFilters({ usuarios, modulos }: { usuarios: string[]; modulos: string[] }) {
  const { getFilter, setFilter, clearFilters } = useFilters()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker />
      <select
        value={getFilter("usuario") || ""}
        onChange={(e) => setFilter("usuario", e.target.value || undefined)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Todos los usuarios</option>
        {usuarios.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <select
        value={getFilter("modulo") || ""}
        onChange={(e) => setFilter("modulo", e.target.value || undefined)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Todos los módulos</option>
        {modulos.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar acción..."
          value={getFilter("accion") || ""}
          onChange={(e) => setFilter("accion", e.target.value || undefined)}
          className="h-8 rounded-md border border-input bg-background pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring w-40"
        />
      </div>
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

function formatFecha(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString("es-HN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function moduloBadgeColor(modulo: string | null) {
  switch (modulo) {
    case "auth": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "usuarios": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    case "produccion": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "hospitalarios": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
  }
}

function PaginationControls({ paginatedData }: { paginatedData: PaginatedLogs }) {
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

export function BitacoraClient({ logs, usuarios, modulos }: BitacoraClientProps) {
  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <LogFilters usuarios={usuarios} modulos={modulos} />
      </Suspense>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Usuario</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Módulo</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Acción</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Detalle</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No hay registros. Ejecute POST /api/seed para crear la tabla de logs.
                  </td>
                </tr>
              ) : (
                logs.data.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {formatFecha(log.fecha)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{log.usuario}</td>
                    <td className="px-3 py-2">
                      {log.modulo && (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${moduloBadgeColor(log.modulo)}`}>
                          {log.modulo}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">{log.accion}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-xs truncate" title={log.detalle || ""}>
                      {log.detalle || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                      {log.ip || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Suspense>
          <PaginationControls paginatedData={logs} />
        </Suspense>
      </div>
    </>
  )
}
