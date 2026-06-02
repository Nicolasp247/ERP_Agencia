/* erp-tour-operator/frontend/src/modules/cliente-agente/cliente-agente-api.ts */

import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

const agenteComisionSchema = z.object({
  porcentajeAgente: z.coerce.number().min(0).max(99),
  porcentajeWtravel: z.coerce.number().min(0).max(99),
  porcentajeBancario: z.coerce.number().min(0).max(99)
});

export const agenteFormSchema = z.object({
  codigo: z.string().min(1),
  razonSocial: z.string().min(1),
  nombreContacto: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  direccion: z.string().optional().nullable(),
  nit: z.string().optional().nullable(),
  idContinente: z.coerce.number().optional().nullable(),
  idPais: z.coerce.number().optional().nullable(),
  idCiudad: z.coerce.number().optional().nullable(),

  /**
   * Este campo se conserva por compatibilidad con pantallas viejas/listados,
   * pero la lógica nueva debe usar cliente_agente_comision.
   */
  comisionBasePct: z.coerce.number().min(0).max(100).optional().nullable(),

  comisiones: z.object({
    terrestre: agenteComisionSchema,
    aerea: agenteComisionSchema
  }),

  activo: z.boolean()
});

export type AgenteFormValues = z.infer<typeof agenteFormSchema>;

export type AgenteComisionTipo = "TERRESTRE" | "AEREA";

export type AgenteComisionResponse = {
  tipoComision: AgenteComisionTipo;
  porcentajeAgente: string;
  porcentajeWtravel: string;
  porcentajeBancario: string;
  activo: boolean;
};

export async function listAgentes() {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/cliente-agente");
  return response.data.data;
}

export async function getAgente(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/cliente-agente/${id}`);
  return response.data.data;
}

function normalizeNullableNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeCommission(value: {
  porcentajeAgente: unknown;
  porcentajeWtravel: unknown;
  porcentajeBancario: unknown;
}) {
  return {
    porcentajeAgente: Number(value.porcentajeAgente ?? 0),
    porcentajeWtravel: Number(value.porcentajeWtravel ?? 0),
    porcentajeBancario: Number(value.porcentajeBancario ?? 0)
  };
}

export async function saveAgente(values: AgenteFormValues, id?: number) {
  const payload = {
    ...values,
    email: values.email || null,
    idContinente: normalizeNullableNumber(values.idContinente),
    idPais: normalizeNullableNumber(values.idPais),
    idCiudad: normalizeNullableNumber(values.idCiudad),
    comisionBasePct: normalizeNullableNumber(values.comisionBasePct),
    comisiones: {
      terrestre: normalizeCommission(values.comisiones.terrestre),
      aerea: normalizeCommission(values.comisiones.aerea)
    }
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/cliente-agente/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/cliente-agente", payload);
  return response.data.data;
}