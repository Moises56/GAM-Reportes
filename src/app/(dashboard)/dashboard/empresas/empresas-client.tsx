"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatNumber, formatDate } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Search, X, FileDown, Loader2 } from "lucide-react"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { useFilters } from "@/hooks/use-filters"
// Lazy load PDF generator to avoid bundling jsPDF with initial page load
const generateBoletaPDF = async (data: BoletaRecord) => {
  const { generateBoletaPDF: gen } = await import("@/lib/generate-boleta-pdf")
  return gen(data)
}

interface PaginatedBoletas {
  data: BoletaRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface BoletaRecord {
  fecha: string
  hora: string
  unidad: string | null
  transportista: string
  transportistaId: number
  motorista: string | null
  placa: string | null
  codigoRuta: number | null
  procedencia: string | null
  pesoBruto: number
  pesoTara: number
  pesoNeto: number
  noBoleta: number
  boletaPeso: string
  pesador: string
  observacion: string | null
}

interface EmpresasClientProps {
  boletas: PaginatedBoletas
}

function formatHora(horaStr: string | null) {
  if (!horaStr) return "—"
  const d = new Date(horaStr)
  const h = d.getUTCHours().toString().padStart(2, "0")
  const m = d.getUTCMinutes().toString().padStart(2, "0")
  return `${h}:${m}`
}

function EmpresasFilters() {
  const { getFilter, setFilter, clearFilters } = useFilters()
  const [searchInput, setSearchInput] = useState(getFilter("search") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter("search", searchInput || undefined)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker />
      <select
        value={getFilter("transportistaId") || ""}
        onChange={(e) => setFilter("transportistaId", e.target.value || undefined)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Ambas Empresas</option>
        <option value="2">AMAHSA</option>
        <option value="1">COSEMSA</option>
      </select>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar boleta, motorista, placa..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 w-56 rounded-md border border-input bg-background pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
      </form>
      <button
        onClick={() => { setSearchInput(""); clearFilters() }}
        className="flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground hover:bg-muted"
      >
        <X className="h-3 w-3" />
        Limpiar
      </button>
    </div>
  )
}

function PaginationControls({ data }: { data: PaginatedBoletas }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`?${params.toString()}`)
  }

  if (data.total === 0) return null

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-[11px] text-muted-foreground">
        Mostrando {((data.page - 1) * data.pageSize) + 1}-
        {Math.min(data.page * data.pageSize, data.total)} de{" "}
        {formatNumber(data.total)}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(data.page - 1)}
          disabled={data.page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 text-xs">
          {data.page} / {data.totalPages}
        </span>
        <button
          onClick={() => goToPage(data.page + 1)}
          disabled={data.page >= data.totalPages}
          className="flex h-7 w-7 items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function EmpresasClient({ boletas }: EmpresasClientProps) {
  const [generatingId, setGeneratingId] = useState<number | null>(null)

  const handleGeneratePDF = async (b: BoletaRecord) => {
    setGeneratingId(b.noBoleta)
    try {
      await generateBoletaPDF(b)
    } catch (err) {
      console.error("Error generating PDF:", err)
    }
    setGeneratingId(null)
  }

  return (
    <>
      <Suspense fallback={<div className="h-8" />}>
        <EmpresasFilters />
      </Suspense>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-[3px] p-0" />
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hora</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Unidad</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Empresa</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Motorista</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Placa</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Micro Ruta</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground max-w-[200px]">Procedencia</th>
                <th className="whitespace-nowrap px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">P. Bruto</th>
                <th className="whitespace-nowrap px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">P. Tara</th>
                <th className="whitespace-nowrap px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">P. Neto</th>
                <th className="whitespace-nowrap px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">No. Boleta</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Boleta Peso</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pesador</th>
                <th className="whitespace-nowrap px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Observación</th>
                <th className="w-8 px-1 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">PDF</th>
              </tr>
            </thead>
            <tbody>
              {boletas.data.length === 0 ? (
                <tr>
                  <td colSpan={17} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                boletas.data.map((b, i) => {
                  const isAmahsa = b.transportistaId === 2
                  const borderColor = isAmahsa ? "bg-[#2563eb]" : "bg-[#16a34a]"
                  const badgeCls = isAmahsa
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"

                  return (
                    <tr
                      key={`${b.noBoleta}-${i}`}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Contractor color indicator */}
                      <td className="w-[3px] p-0">
                        <div className={`h-full min-h-[32px] ${borderColor}`} />
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">
                        {formatDate(b.fecha)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-muted-foreground">
                        {formatHora(b.hora)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono font-medium">
                        {b.unidad || "—"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5">
                        <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${badgeCls}`}>
                          {b.transportista}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 max-w-[140px] truncate" title={b.motorista || ""}>
                        {b.motorista || "—"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono">
                        {b.placa || "—"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-center">
                        {b.codigoRuta || "—"}
                      </td>
                      <td className="px-2 py-1.5 max-w-[200px] truncate text-muted-foreground" title={b.procedencia ? b.procedencia.replace(/,\s*$/, "").replace(/,\s{4}/g, ", ") : ""}>
                        {b.procedencia ? b.procedencia.replace(/,\s*$/, "").replace(/,\s{4}/g, ", ") : "—"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono tabular-nums">
                        {formatNumber(b.pesoBruto)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono tabular-nums">
                        {formatNumber(b.pesoTara)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono tabular-nums font-medium">
                        {formatNumber(b.pesoNeto)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono tabular-nums">
                        {b.noBoleta}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10px]">
                        {b.boletaPeso}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-muted-foreground max-w-[120px] truncate" title={b.pesador}>
                        {b.pesador}
                      </td>
                      <td className="px-2 py-1.5 max-w-[140px] truncate text-muted-foreground" title={b.observacion || ""}>
                        {b.observacion || "—"}
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => handleGeneratePDF(b)}
                          disabled={generatingId === b.noBoleta}
                          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          title="Generar Boleta PDF"
                        >
                          {generatingId === b.noBoleta ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-3 py-2">
          <Suspense>
            <PaginationControls data={boletas} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
