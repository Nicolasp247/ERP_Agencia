/* erp-tour-operator/backend/src/modules/tarifa/dto/tarifa.dto.ts */

import { z } from "zod";

export const tarifaSchema = z
  .object({
    idServicio: z.coerce.number().int().positive(),

    fechaDesde: z.string().min(1),
    fechaHasta: z.string().min(1),

    tipoTarifa: z.string().trim().min(1).max(50),
    unidadPrecio: z.string().trim().min(1).max(50),

    precioNeto: z.coerce.number().nonnegative(),
    monedaCodigo: z.string().trim().length(3).default("USD"),

    activo: z.boolean().default(true),
    observaciones: z.string().trim().optional().nullable(),
    fechaRevision: z.string().optional().nullable()
  })
  .refine((data) => new Date(data.fechaDesde) <= new Date(data.fechaHasta), {
    message: "La fecha desde no puede ser mayor que la fecha hasta",
    path: ["fechaHasta"]
  });

export const tarifaIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type TarifaInput = z.infer<typeof tarifaSchema>;