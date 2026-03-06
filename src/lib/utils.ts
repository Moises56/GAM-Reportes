import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCurrency(value: number, currency: "USD" | "HNL" = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "HNL" ? "HNL" : "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function lbsToTons(lbs: number): number {
  return lbs / 2204.62
}

export function formatTons(lbs: number): string {
  return formatNumber(lbsToTons(lbs), 2)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-HN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-HN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
