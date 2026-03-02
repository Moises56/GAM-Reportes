export interface KPIData {
  label: string
  value: string | number
  subtitle?: string
  trend?: { value: number; isPositive: boolean }
  icon?: string
}

export interface ChartDataPoint {
  name: string
  amahsa?: number
  cosemsa?: number
  total?: number
  value?: number
}

export interface ProduccionRow {
  fecha: string
  transportista: string
  vehiculo: string
  placa: string
  ruta: string
  turno: string
  pesoBruto: number
  tara: number
  pesoNeto: number
  tipoBasura: string
}

export interface FacturacionRow {
  mes: string
  transportista: string
  toneladas: number
  precioPorTon: number
  totalUSD: number
  tipoCambio: number
  totalHNL: number
  estimado: number
}

export interface FlotaRow {
  vehiculoId: number
  unidad: string
  placa: string
  modelo: string
  capacidad: number | null
  transportista: string
  viajes: number
  pesoTotal: number
  promedioPorViaje: number
}

export interface RutaRow {
  rutaId: number
  codigo: string
  turno: string
  frecuencia: string
  transportista: string
  colonias: number
  viajes: number
  pesoTotal: number
}

export interface MultaRow {
  id: number
  fecha: string
  transportista: string
  memorandum: string
  tipoIncumplimiento: string
  monto: number
  pesoMultado: number
}

export interface MermaRow {
  id: number
  fecha: string
  transportista: string
  peso: number
  observacion: string
}

export interface ComparativoData {
  metric: string
  amahsa: number | string
  cosemsa: number | string
}

export interface ReportFilters {
  fechaInicio?: string
  fechaFin?: string
  transportistaId?: number
  turno?: string
  rutaId?: number
  tipoBasuraId?: number
  temporada?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
}
