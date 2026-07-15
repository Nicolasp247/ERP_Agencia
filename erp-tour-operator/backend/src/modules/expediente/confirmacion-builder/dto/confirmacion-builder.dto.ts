/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto.ts */

import { z } from "zod";

export const confirmacionBuilderCreateSchema = z.object({
  selectedColumnIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Debes seleccionar al menos una categoría / acomodación")
});

export type ConfirmacionBuilderCreateInput = z.infer<typeof confirmacionBuilderCreateSchema>;

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD");

export const confirmacionPassengerSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  apellidos: z.string().trim().min(1, "Los apellidos son obligatorios").max(120),
  fechaNacimiento: dateStringSchema,
  numeroPasaporte: z.string().trim().min(1, "El pasaporte es obligatorio").max(80),
  fechaExpedicionPasaporte: dateStringSchema,
  fechaVencimientoPasaporte: dateStringSchema,
  nacionalidad: z.string().trim().min(1, "La nacionalidad es obligatoria").max(80)
});

export const confirmacionBuilderPriceSchema = z.object({
  prices: z.array(
    z.object({
      columnId: z.coerce.number().int().positive(),
      precioConfirmado: z.coerce.number().min(0).nullable()
    })
  )
});

export const confirmacionBuilderNoteSchema = z.object({
  notaLinea: z.string().trim().max(1000).nullable(),
  tituloOverride: z.string().trim().max(500).nullable().optional()
});

export const confirmacionBuilderMoveItemSchema = z.object({
  direction: z.enum(["UP", "DOWN"])
});

export const confirmacionBuilderHotelPreviewSchema = z.object({
  hotels: z.array(
    z.object({
      columnId: z.coerce.number().int().positive(),
      textoHotel: z.string().trim().max(500).nullable().optional()
    })
  )
});

export const confirmacionBuilderFreeNotesSchema = z.object({
  nota: z.string().max(10000).nullable()
});

export type ConfirmacionBuilderPriceInput = z.infer<typeof confirmacionBuilderPriceSchema>;
export type ConfirmacionBuilderNoteInput = z.infer<typeof confirmacionBuilderNoteSchema>;
export type ConfirmacionBuilderMoveItemInput = z.infer<typeof confirmacionBuilderMoveItemSchema>;
export type ConfirmacionBuilderHotelPreviewInput = z.infer<typeof confirmacionBuilderHotelPreviewSchema>;
export type ConfirmacionBuilderFreeNotesInput = z.infer<typeof confirmacionBuilderFreeNotesSchema>;
export type ConfirmacionPassengerInput = z.infer<typeof confirmacionPassengerSchema>;