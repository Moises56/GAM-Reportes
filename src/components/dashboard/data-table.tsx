"use client"

import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  label: string
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
  align?: "left" | "right" | "center"
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
