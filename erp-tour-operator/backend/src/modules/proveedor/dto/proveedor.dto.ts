import { z } from "zod";

export const proveedorContactoSchema = z.object({
  nombreContacto: z.string().max(120).optional().nullable(),
  email: z.string().email(),
  telefono: z.string().max(40).optional().nullable(),
  cargo: z.string().max(80).optional().nullable(),
  principal: z.boolean().default(false),
  activo: z.boolean().default(true)
});

export const proveedorSchema = z.object({
  codigo: z.string().max(10).optional().nullable(),
  nombreComercial: z.string().min(1).max(100),
  sitioWeb: z.string().url().optional().nullable(),
  idPais: z.coerce.number().int().positive().optional().nullable(),
  idCiudad: z.coerce.number().int().positive().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  activo: z.boolean().optional(),
  contactos: z.array(proveedorContactoSchema).default([])
});

export const proveedorFilterSchema = z.object({
  search: z.string().optional(),
  idPais: z.coerce.number().int().positive().optional(),
  idTipoServicio: z.coerce.number().int().positive().optional(),
  activo: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export type ProveedorInput = z.infer<typeof proveedorSchema>;
export type ProveedorFilters = z.infer<typeof proveedorFilterSchema>;
