import { z } from "zod";

export const tarifaSchema = z.object({
  idServicio: z.coerce.number().int().positive(),
  anio: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  tipoHabitacion: z.string().min(1).max(3).default("DBL"),
  precioUsd: z.coerce.number().nonnegative().optional().nullable(),
  monedaCodigo: z.string().length(3).default("USD"),
  activo: z.boolean().default(true)
});

export const tarifaFilterSchema = z.object({
  idServicio: z.coerce.number().int().positive().optional(),
  anio: z.coerce.number().int().min(2000).max(2100).optional(),
  mes: z.coerce.number().int().min(1).max(12).optional()
});

export const tarifaKeyParamSchema = z.object({
  idServicio: z.coerce.number().int().positive(),
  anio: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  tipoHabitacion: z.string().min(1).max(3)
});

export type TarifaInput = z.infer<typeof tarifaSchema>;
export type TarifaFilters = z.infer<typeof tarifaFilterSchema>;
