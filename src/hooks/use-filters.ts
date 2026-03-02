"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"

export function useFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const getFilter = useCallback(
    (key: string) => searchParams.get(key) || undefined,
    [searchParams]
  )

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page") // Reset page on filter change
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, searchParams, pathname]
  )

  const setFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, searchParams, pathname]
  )

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return {
    fechaInicio: getFilter("fechaInicio"),
    fechaFin: getFilter("fechaFin"),
    transportistaId: getFilter("transportistaId"),
    turno: getFilter("turno"),
    rutaId: getFilter("rutaId"),
    page: getFilter("page"),
    sortBy: getFilter("sortBy"),
    sortDir: getFilter("sortDir") as "asc" | "desc" | undefined,
    getFilter,
    setFilter,
    setFilters,
    clearFilters,
  }
}
