/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto.ts */

import { z } from "zod";

export const confirmacionBuilderCreateSchema = z.object({
  selectedColumnIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Debes seleccionar al menos una categoría / acomodación")
});

export type ConfirmacionBuilderCreateInput = z.infer<typeof confirmacionBuilderCreateSchema>;