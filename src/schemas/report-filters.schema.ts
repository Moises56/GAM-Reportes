import { z } from "zod"

export const reportFiltersSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  transportistaId: z.coerce.number().optional(),
  turno: z.string().optional(),
  rutaId: z.coerce.number().optional(),
  tipoBasuraId: z.coerce.number().optional(),
  temporada: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(10).max(100).default(50),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
})

export type ReportFiltersInput = z.input<typeof reportFiltersSchema>
export type ReportFiltersOutput = z.output<typeof reportFiltersSchema>
