/* erp-tour-operator/backend/src/modules/cotizacion/dto/cotizacion.dto.ts */

import { z } from "zod";

export const cotizacionItemSchema = z.object({
  idServicio: z.coerce.number().int().positive(),
  fechaServicio: z.coerce.date(),
  ordenDia: z.coerce.number().int().positive(),
  esOpcional: z.boolean().default(false),
  operadorMostrado: z.string().max(150).optional().nullable(),
  linkOperador: z.string().url().optional().nullable(),
  tituloOverride: z.string().max(255).optional().nullable(),
  claseOverride: z.string().max(50).optional().nullable(),
  idiomaOverride: z.string().max(50).optional().nullable(),
  notaLinea: z.string().optional().nullable(),
  precioSugerido: z.coerce.number().nonnegative().optional().nullable(),
  precioVenta: z.coerce.number().nonnegative().optional().nullable(),
  precioMonedaCodigo: z.string().length(3).optional().nullable()
});

export const cotizacionSchema = z.object({
  idCliente: z.coerce.number().int().positive(),
  idClienteAgente: z.coerce.number().int().positive().optional().nullable(),
  nombreCotizacion: z.string().min(1).max(255),
  fechaViajePrincipal: z.coerce.date(),
  idDestinoPrincipal: z.coerce.number().int().positive().optional().nullable(),
  categoriaViaje: z.string().max(50).optional().nullable(),
  monedaCodigo: z.string().length(3).default("USD"),
  presupuestoEstimado: z.coerce.number().nonnegative().optional().nullable(),
  presupuestoTipo: z.enum(["POR_PERSONA", "TOTAL"]).optional().nullable(),
  comisionPctAplicada: z.coerce.number().min(0).max(100).optional().nullable(),
  margenAplicadoValor: z.coerce.number().nonnegative().optional().nullable(),
  adultos65: z.coerce.number().int().min(0).default(0),
  adultos1964: z.coerce.number().int().min(0).default(0),
  jovenes1218: z.coerce.number().int().min(0).default(0),
  ninos311: z.coerce.number().int().min(0).default(0),
  infantes02: z.coerce.number().int().min(0).default(0),
  totalPasajeros: z.coerce.number().int().min(0),
  nota: z.string().optional().nullable(),
  items: z.array(cotizacionItemSchema).min(1)
});

export const cotizacionFilterSchema = z.object({
  estado: z.enum(["ACTIVA", "DESCARTADA", "CONVERTIDA_RESERVA"]).optional(),
  idCliente: z.coerce.number().int().positive().optional(),
  idClienteAgente: z.coerce.number().int().positive().optional(),
  idDestinoPrincipal: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
});

export const cotizacionIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type CotizacionInput = z.infer<typeof cotizacionSchema>;
export type CotizacionItemInput = z.infer<typeof cotizacionItemSchema>;
export type CotizacionFilters = z.infer<typeof cotizacionFilterSchema>;
