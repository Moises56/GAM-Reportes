"use client"

import { DataTable } from "@/components/dashboard/data-table"
import { formatNumber, formatDate } from "@/lib/utils"

interface OverviewTableProps {
  data: Record<string, unknown>[]
}

export function OverviewTable({ data }: OverviewTableProps) {
  return (
    <DataTable
      columns={[
        { key: "fecha", label: "Fecha", render: (v) => formatDate(v as string) },
        { key: "transportista", label: "Transportista" },
        { key: "placa", label: "Placa" },
        { key: "ruta", label: "Ruta" },
        { key: "pesoBruto", label: "Bruto (lbs)", align: "right", render: (v) => formatNumber(v as number) },
        { key: "tara", label: "Tara (lbs)", align: "right", render: (v) => formatNumber(v as number) },
        { key: "pesoNeto", label: "Neto (lbs)", align: "right", render: (v) => formatNumber(v as number) },
      ]}
      data={data}
    />
  )
}
