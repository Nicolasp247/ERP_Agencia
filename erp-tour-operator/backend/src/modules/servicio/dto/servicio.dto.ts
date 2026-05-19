import { z } from "zod";

const alojamientoSchema = z.object({
  noches: z.coerce.number().int().positive(),
  habitaciones: z.coerce.number().int().positive(),
  desayuno: z.boolean().default(true),
  regimen: z
    .enum(["SOLO_ALOJAMIENTO", "ALOJAMIENTO_DESAYUNO", "TODO_INCLUIDO", "OTRO"])
    .optional()
    .nullable(),
  regimenOtro: z.string().max(80).optional().nullable(),
  categoriaHotel: z
    .enum([
      "H3_ECONOMICO",
      "H3_SUPERIOR",
      "H4_ECONOMICO",
      "H4_SUPERIOR",
      "H5_ECONOMICO",
      "H5_SUPERIOR",
      "LUJO_ECONOMICO",
      "LUJO_SUPERIOR",
      "OTRO"
    ])
    .optional()
    .nullable(),
  categoriaHotelOtro: z.string().max(80).optional().nullable(),
  categoriaHab: z.enum(["ESTANDAR", "SUPERIOR", "SUITE", "OTRO"]).optional().nullable(),
  categoriaHabOtro: z.string().max(80).optional().nullable(),
  proveedorHotel: z.string().max(10).optional().nullable()
});

const tourSchema = z.object({
  idTipoGuia: z.coerce.number().int().positive(),
  idIdioma: z.coerce.number().int().positive()
});

const trasladoSchema = z
  .object({
    idOrigen: z.coerce.number().int().positive().optional().nullable(),
    idDestino: z.coerce.number().int().positive().optional().nullable(),
    nuevoOrigen: z.string().max(150).optional().nullable(),
    nuevoDestino: z.string().max(150).optional().nullable(),
    escalas: z.coerce.number().int().min(0).default(0),
    vehiculo: z.string().max(100).optional().nullable()
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
});

const trenSchema = z.object({
  origen: z.string().min(1).max(100),
  destino: z.string().min(1).max(100),
  escalas: z.coerce.number().int().min(0).default(0),
  clase: z.string().min(1).max(50),
  sillasReservadas: z.boolean().default(true),
  equipaje: z.string().max(255).optional().nullable()
});

const vueloSchema = z.object({
  origen: z.string().min(1).max(100),
  destino: z.string().min(1).max(100),
  escalas: z.coerce.number().int().min(0).default(0),
  clase: z.string().min(1).max(50),
  equipaje: z.string().min(1).max(100)
});

export const tipoServicioSchema = z.object({
  nombre: z.string().min(1).max(50),
  codigo: z.string().min(1).max(20).optional().nullable(),
  activo: z.boolean().optional()
});

export const servicioSchema = z.object({
  idTipo: z.coerce.number().int().positive(),
  idProveedor: z.coerce.number().int().positive(),
  idCiudad: z.coerce.number().int().positive(),
  nombreWtravel: z.string().min(1).max(120),
  tiempoServicio: z.string().max(50).optional().nullable(),
  privado: z.boolean().default(false),
  descripcion: z.string().optional().nullable(),
  linkReserva: z.string().url().optional().nullable(),
  activo: z.boolean().optional(),
  alojamiento: alojamientoSchema.optional(),
  tour: tourSchema.optional(),
  traslado: trasladoSchema.optional(),
  tren: trenSchema.optional(),
  vuelo: vueloSchema.optional()
});

export const servicioEstadoSchema = z.object({
  activo: z.boolean()
});

export const servicioFilterSchema = z.object({
  search: z.string().optional(),
  idTipo: z.coerce.number().int().positive().optional(),
  idProveedor: z.coerce.number().int().positive().optional(),
  idContinente: z.coerce.number().int().positive().optional(),
  idPais: z.coerce.number().int().positive().optional(),
  idCiudad: z.coerce.number().int().positive().optional(),
  activo: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});
  
export type TipoServicioInput = z.infer<typeof tipoServicioSchema>;
export type ServicioInput = z.infer<typeof servicioSchema>;
export type ServicioFilters = z.infer<typeof servicioFilterSchema>;
export const puntoTrasladoFilterSchema = z.object({
  idCiudad: z.coerce.number().int().positive()
});
export type ServicioEstadoInput = z.infer<typeof servicioEstadoSchema>;

export type PuntoTrasladoFilters = z.infer<typeof puntoTrasladoFilterSchema>;
