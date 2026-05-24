/* erp-tour-operator/backend/src/modules/cotizacion-builder/dto/cotizacion-builder.dto.ts */

import { z } from "zod";

export const cotizacionBuilderColumnSchema = z.object({
  grupo: z.string().trim().min(1).max(80),
  nombre: z.string().trim().min(1).max(80),
  tipo: z.enum(["TERRESTRE", "TRANSPORTE", "OPCIONALES", "OTRO"]),
  unidad: z.enum(["POR_PERSONA", "POR_NINO", "POR_HABITACION", "POR_GRUPO"]),
  multiplicador: z.coerce.number().int().min(1).default(1),
  orden: z.coerce.number().int().positive().optional()
});

export type CotizacionBuilderColumnInput = z.infer<typeof cotizacionBuilderColumnSchema>;