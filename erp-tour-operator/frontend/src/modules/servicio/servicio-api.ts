import { z } from "zod";

import { api } from "@/services/http";
import type { ApiResponse } from "@/types/api";

const optionalText = z.string().optional().nullable();

export const NUEVO_PUNTO_OPTION = "__new__";

export const servicioFormSchema = z.object({
  idTipo: z.coerce.number().int().positive(),
  idProveedor: z.coerce.number().int().positive(),
  idCiudad: z.coerce.number().int().positive(),
  nombreWtravel: z.string().min(1),
  tiempoServicio: optionalText,
  privado: z.boolean().default(false),
  descripcion: optionalText,
  linkReserva: z.string().url().optional().nullable().or(z.literal("")),
  activo: z.boolean().default(true),
  alojamiento: z
    .object({
      noches: z.coerce.number().int().positive(),
      habitaciones: z.coerce.number().int().positive(),
      desayuno: z.boolean().default(true)
    })
    .optional(),
  tour: z
    .object({
      idTipoGuia: z.coerce.number().int().positive(),
      idIdioma: z.coerce.number().int().positive()
    })
    .optional(),
  traslado: z
    .object({
      idOrigen: z.coerce.number().int().positive().optional().nullable(),
      idDestino: z.coerce.number().int().positive().optional().nullable(),
      nuevoOrigen: optionalText,
      nuevoDestino: optionalText,
      escalas: z.coerce.number().int().min(0).default(0),
      vehiculo: optionalText
    })
    .refine((data) => Boolean(data.idOrigen || data.nuevoOrigen?.trim()), {
      message: "Debes seleccionar o crear un origen",
      path: ["idOrigen"]
    })
    .refine((data) => Boolean(data.idDestino || data.nuevoDestino?.trim()), {
      message: "Debes seleccionar o crear un destino",
      path: ["idDestino"]
    })
    .refine((data) => {
      const origenKey = data.idOrigen
        ? `id:${data.idOrigen}`
        : `txt:${(data.nuevoOrigen ?? "").trim().toLowerCase()}`;
      const destinoKey = data.idDestino
        ? `id:${data.idDestino}`
        : `txt:${(data.nuevoDestino ?? "").trim().toLowerCase()}`;
      return origenKey !== destinoKey;
    }, {
      message: "El origen y el destino no pueden ser iguales",
      path: ["idDestino"]
    })
    .optional(),
  tren: z
    .object({
      origen: z.string().min(1),
      destino: z.string().min(1),
      escalas: z.coerce.number().int().min(0).default(0),
      clase: z.string().min(1),
      sillasReservadas: z.boolean().default(true),
      equipaje: optionalText
    })
    .optional(),
  vuelo: z
    .object({
      origen: z.string().min(1),
      destino: z.string().min(1),
      escalas: z.coerce.number().int().min(0).default(0),
      clase: z.string().min(1),
      equipaje: z.string().min(1)
    })
    .optional()
});

export type ServicioFormValues = z.infer<typeof servicioFormSchema>;

export async function listTiposServicio() {
  const response = await api.get<
    ApiResponse<Array<{ id: number; nombre: string; codigo: string | null; activo: boolean }>>
  >("/servicio/tipos");
  return response.data.data;
}

export type ServicioListFilters = {
  idContinente?: number;
  idPais?: number;
  idCiudad?: number;
  idTipo?: number;
};

export async function listServicios(filters?: ServicioListFilters) {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>("/servicio", {
    params: filters
  });
  return response.data.data;
}

export async function getServicio(id: number) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(`/servicio/${id}`);
  return response.data.data;
}

export async function saveServicio(values: ServicioFormValues, id?: number) {
  const payload = {
    ...values,
    linkReserva: values.linkReserva || null
  };

  if (id) {
    const response = await api.put<ApiResponse<Record<string, unknown>>>(`/servicio/${id}`, payload);
    return response.data.data;
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/servicio", payload);
  return response.data.data;
}

export async function listIdiomas() {
  const response = await api.get<ApiResponse<Array<{ id: number; nombre: string }>>>("/servicio/idiomas");
  return response.data.data;
}

export async function listTiposGuia() {
  const response = await api.get<ApiResponse<Array<{ id: number; nombre: string }>>>("/servicio/tipos-guia");
  return response.data.data;
}

export async function listPuntosTraslado(idCiudad: number) {
  const response = await api.get<ApiResponse<Array<{ id: number; nombre: string }>>>(
    "/servicio/puntos-traslado",
    {
      params: { idCiudad }
    }
  );

  return response.data.data;
}