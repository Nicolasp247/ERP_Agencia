import { z } from "zod";

export const reporteFilterSchema = z.object({
  idClienteAgente: z.coerce.number().int().positive().optional(),
  idCliente: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
});

export type ReporteFilters = z.infer<typeof reporteFilterSchema>;
