import { z } from "zod";

export const reservaFilterSchema = z.object({
  idCliente: z.coerce.number().int().positive().optional(),
  idClienteAgente: z.coerce.number().int().positive().optional(),
  estado: z.enum(["PENDIENTE", "PARCIALMENTE_CONFIRMADA", "CONFIRMADA", "CANCELADA"]).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
});

export const reservaIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const reservaItemIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive()
});

export const reservaUpdateSchema = z.object({
  nota: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        id: z.coerce.number().int().positive(),
        costoFinal: z.coerce.number().nonnegative().optional().nullable(),
        estadoItem: z.enum(["PENDIENTE", "CONFIRMADO", "CANCELADO", "NO_APLICA"]).optional()
      })
    )
    .default([])
});

export const reservaConfirmacionItemSchema = z.object({
  numeroConfirmacion: z.string().max(120).optional().nullable(),
  estadoItem: z.enum(["PENDIENTE", "CONFIRMADO", "CANCELADO", "NO_APLICA"]).optional()
});

export const reservaCancelSchema = z.object({
  motivoCancelacion: z.string().min(1).max(255)
});

export type ReservaFilters = z.infer<typeof reservaFilterSchema>;
export type ReservaUpdateInput = z.infer<typeof reservaUpdateSchema>;
export type ReservaConfirmacionItemInput = z.infer<typeof reservaConfirmacionItemSchema>;
export type ReservaCancelInput = z.infer<typeof reservaCancelSchema>;
