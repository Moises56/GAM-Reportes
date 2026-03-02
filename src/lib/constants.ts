// Transportista IDs from database
export const TRANSPORTISTA = {
  AMAHSA: { id: 1, name: "AMAHSA", color: "#2563eb", pricePerTon: 32.31 },
  COSEMSA: { id: 2, name: "COSEMSA", color: "#16a34a", pricePerTon: 26.90 },
  AMDC: { id: 3, name: "AMDC", color: "#64748b" },
  PARTICULARES: { id: 4, name: "PARTICULARES", color: "#f97316" },
} as const

export const LBS_PER_TON = 2204.62

export const CHART_COLORS = {
  amahsa: "#2563eb",
  cosemsa: "#16a34a",
  amdc: "#64748b",
  particulares: "#f97316",
  primary: "#2563eb",
  secondary: "#16a34a",
  muted: "#94a3b8",
  warning: "#f59e0b",
  danger: "#ef4444",
} as const

export const TURNOS = ["DIURNO", "NOCTURNO"] as const

export const REPORT_TYPES = [
  "produccion",
  "facturacion",
  "flota",
  "rutas",
  "multas",
  "comparativo",
  "bascula",
  "hospitalarios",
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard/overview", icon: "LayoutDashboard" },
  { label: "Producción", href: "/dashboard/produccion", icon: "Weight" },
  { label: "Facturación", href: "/dashboard/facturacion", icon: "Receipt" },
  { label: "Flota", href: "/dashboard/flota", icon: "Truck" },
  { label: "Rutas", href: "/dashboard/rutas", icon: "Route" },
  { label: "Multas y Mermas", href: "/dashboard/multas", icon: "AlertTriangle" },
  { label: "Comparativo", href: "/dashboard/comparativo", icon: "ArrowLeftRight" },
  { label: "Báscula", href: "/dashboard/bascula", icon: "Scale" },
  { label: "Hospitalarios", href: "/dashboard/hospitalarios", icon: "Hospital" },
  { label: "Usuarios", href: "/dashboard/usuarios", icon: "Users", adminOnly: true },
] as const
