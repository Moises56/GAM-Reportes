"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Loader2 } from "lucide-react"

interface ExportButtonProps {
  tipo: string
}

export function ExportButton({ tipo }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tipo", tipo)
      const response = await fetch(`/api/export/excel?${params.toString()}`)

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `GAM_${tipo}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Excel
    </button>
  )
}
