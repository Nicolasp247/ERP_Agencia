/* erp-tour-operator/backend/src/modules/cliente-agente/dto/cliente-agente.dto.ts */

import { z } from "zod";

const clienteAgenteComisionSchema = z.object({
  porcentajeAgente: z.coerce.number().min(0).max(100),
  porcentajeWtravel: z.coerce.number().min(0).max(100),
  porcentajeBancario: z.coerce.number().min(0).max(100)
});

export const clienteAgenteSchema = z.object({
  codigo: z.string().min(1).max(20),
  razonSocial: z.string().min(1).max(150),
  nombreContacto: z.string().max(120).optional().nullable(),
  telefono: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  direccion: z.string().max(255).optional().nullable(),
  nit: z.string().max(60).optional().nullable(),
  idPais: z.coerce.number().int().positive().optional().nullable(),
  idCiudad: z.coerce.number().int().positive().optional().nullable(),
  comisionBasePct: z.coerce.number().min(0).max(100).optional().nullable(),
  comisiones: z.object({
    terrestre: clienteAgenteComisionSchema.optional(),
    aerea: clienteAgenteComisionSchema.optional()
  })
  .optional(),
  activo: z.boolean().optional()
});

export const clienteAgenteFilterSchema = z.object({
  search: z.string().optional(),
  codigo: z.string().optional(),
  activo: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export type ClienteAgenteInput = z.infer<typeof clienteAgenteSchema>;
export type ClienteAgenteFilters = z.infer<typeof clienteAgenteFilterSchema>;
