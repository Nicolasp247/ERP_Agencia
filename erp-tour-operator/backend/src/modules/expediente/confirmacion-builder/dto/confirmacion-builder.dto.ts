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

export type ConfirmacionPassengerInput = z.infer<typeof confirmacionPassengerSchema>;