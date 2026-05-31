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

export const cotizacionBuilderItemSchema = z.object({
  idServicio: z.coerce.number().int().positive(),
  fechaServicio: z.string().min(1),
  ordenDia: z.coerce.number().int().positive().optional(),
  esOpcional: z.coerce.boolean().default(false),
  notaLinea: z.string().trim().optional().nullable(),
  idCotizacionColumnaManual: z.coerce.number().int().positive().optional(),
  alojamiento: z
    .object({
      noches: z.coerce.number().int().positive(),
      habitaciones: z.coerce.number().int().positive().default(1),
      categoriaHab: z
        .enum(["ESTANDAR", "SUPERIOR", "SUITE", "OTRO"])
        .default("ESTANDAR"),
      regimen: z
        .enum(["SOLO_ALOJAMIENTO", "ALOJAMIENTO_DESAYUNO", "TODO_INCLUIDO", "OTRO"])
        .default("ALOJAMIENTO_DESAYUNO")
    })
    .optional()
});

export const cotizacionBuilderMoveItemSchema = z.object({
  direction: z.enum(["UP", "DOWN"])
});

export const cotizacionBuilderPriceSchema = z.object({
  prices: z.array(
    z.object({
      columnId: z.coerce.number().int().positive(),
      precioNeto: z.coerce.number().min(0).nullable()
    })
  )
});

export const cotizacionBuilderNoteSchema = z.object({
  notaLinea: z.string().trim().max(1000).nullable(),
  tituloOverride: z.string().trim().max(500).nullable().optional()
});

export const cotizacionBuilderColumnShownPriceSchema = z.object({
  precioMostradoFormula: z.string().trim().max(120).nullable(),
  precioMostradoValor: z.coerce.number().min(0).nullable()
});

export type CotizacionBuilderColumnInput = z.infer<typeof cotizacionBuilderColumnSchema>;
export type CotizacionBuilderItemInput = z.infer<typeof cotizacionBuilderItemSchema>;
export type CotizacionBuilderPriceInput = z.infer<typeof cotizacionBuilderPriceSchema>;
export type CotizacionBuilderMoveItemInput = z.infer<typeof cotizacionBuilderMoveItemSchema>;
export type CotizacionBuilderNoteInput = z.infer<typeof cotizacionBuilderNoteSchema>;
export type CotizacionBuilderColumnShownPriceInput = z.infer<typeof cotizacionBuilderColumnShownPriceSchema>;