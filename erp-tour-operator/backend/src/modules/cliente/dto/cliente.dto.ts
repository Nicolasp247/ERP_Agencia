import { z } from "zod";

export const clienteSchema = z.object({
  idClienteAgente: z.coerce.number().int().positive().optional().nullable(),
  nombreCompleto: z.string().min(1).max(150),
  telefono: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  idPais: z.coerce.number().int().positive().optional().nullable(),
  idCiudad: z.coerce.number().int().positive().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  activo: z.boolean().optional()
});

export const clienteFilterSchema = z.object({
  search: z.string().optional(),
  idClienteAgente: z.coerce.number().int().positive().optional(),
  activo: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export type ClienteInput = z.infer<typeof clienteSchema>;
export type ClienteFilters = z.infer<typeof clienteFilterSchema>;
