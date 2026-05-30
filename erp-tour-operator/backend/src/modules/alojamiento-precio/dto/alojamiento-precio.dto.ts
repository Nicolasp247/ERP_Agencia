/* erp-tour-operator/backend/src/modules/alojamiento-precio/dto/alojamiento-precio.dto.ts */

import { z } from "zod";

export const alojamientoPrecioSchema = z
  .object({
    idCiudad: z.coerce.number().int().positive(),

    categoria: z.enum([
      "H3_ECONOMICO",
      "H3_SUPERIOR",
      "H4_ECONOMICO",
      "H4_SUPERIOR",
      "H5_ECONOMICO",
      "H5_SUPERIOR",
      "LUJO_ECONOMICO",
      "LUJO_SUPERIOR",
      "OTRO"
    ]),

    categoriaHab: z.enum(["ESTANDAR", "SUPERIOR", "SUITE", "OTRO"]),

    regimen: z.enum([
      "SOLO_ALOJAMIENTO",
      "ALOJAMIENTO_DESAYUNO",
      "TODO_INCLUIDO",
      "OTRO"
    ]),

    fechaDesde: z.string().min(1, "La fecha desde es obligatoria"),
    fechaHasta: z.string().min(1, "La fecha hasta es obligatoria"),

    tipoHabitacion: z.enum(["SGL", "DBL", "TPL", "CPL"]),

    precioUsd: z.coerce.number().nonnegative().nullable().optional(),
    monedaCodigo: z.string().trim().length(3).default("USD"),
    activo: z.coerce.boolean().default(true)
  })
  .refine((data) => new Date(data.fechaDesde) <= new Date(data.fechaHasta), {
    message: "La fecha desde no puede ser mayor que la fecha hasta",
    path: ["fechaHasta"]
  });

export const alojamientoPrecioIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const alojamientoPrecioFilterSchema = z.object({
  idCiudad: z.coerce.number().int().positive().optional(),
  categoria: z.string().trim().optional(),
  categoriaHab: z.string().trim().optional(),
  regimen: z.string().trim().optional(),
  fechaDesde: z.string().trim().optional(),
  fechaHasta: z.string().trim().optional(),
  tipoHabitacion: z.string().trim().optional(),
  activo: z.coerce.boolean().optional()
});

export type AlojamientoPrecioInput = z.infer<typeof alojamientoPrecioSchema>;
export type AlojamientoPrecioFilter = z.infer<typeof alojamientoPrecioFilterSchema>;