import { z } from "zod";

export const auditoriaQuerySchema = z.object({
  entidad: z.string().optional(),
  entidadId: z.coerce.number().int().positive().optional(),
  accion: z.string().optional()
});

export type AuditoriaQuery = z.infer<typeof auditoriaQuerySchema>;
