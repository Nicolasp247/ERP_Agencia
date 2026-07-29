// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto.ts

import { z } from "zod";

const dateStringSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "La fecha debe tener formato YYYY-MM-DD"
  );

const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) =>
    value.toUpperCase()
  );

const operationalStateSchema = z.enum([
  "BORRADOR",
  "SOLICITADA",
  "CONFIRMADA",
  "REALIZADA"
]);

const cancellationTypeSchema = z.enum([
  "GRATUITA_HASTA",
  "NO_REEMBOLSABLE",
  "CONDICIONES_ESPECIALES"
]);

const paymentTypeSchema = z.enum([
  "PAGO",
  "REEMBOLSO",
  "AJUSTE"
]);

const nullablePositiveNumberSchema =
  z.coerce
    .number()
    .positive()
    .nullable()
    .optional();

function validatePaymentAmount(
  value: {
    tipo?: "PAGO" | "REEMBOLSO" | "AJUSTE";
    valorMonedaOriginal?: number;
  },
  context: z.RefinementCtx
) {
  if (
    value.valorMonedaOriginal === undefined
  ) {
    return;
  }

  if (
    value.tipo !== "AJUSTE" &&
    value.valorMonedaOriginal <= 0
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["valorMonedaOriginal"],
      message:
        "El valor de un pago o reembolso debe ser mayor que cero"
    });
  }

  if (
    value.tipo === "AJUSTE" &&
    value.valorMonedaOriginal === 0
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["valorMonedaOriginal"],
      message:
        "El valor del ajuste no puede ser cero"
    });
  }
}

export const comprasProveedorCreateSchema =
  z.object({
    codigoProveedor: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .nullable()
      .optional(),

    estadoOperativo:
      operationalStateSchema.default(
        "BORRADOR"
      ),

    fechaReserva:
      dateStringSchema.optional(),

    fechaConfirmacion:
      dateStringSchema.nullable().optional(),

    fechaPrevistaCobro:
      dateStringSchema.nullable().optional(),

    tipoCancelacion:
      cancellationTypeSchema
        .nullable()
        .optional(),

    fechaLimiteCancelacion:
      dateStringSchema.nullable().optional(),

    valorContratado: z.coerce
      .number()
      .min(0)
      .nullable()
      .optional(),

    monedaCodigo:
      currencySchema.default("USD"),

    notaAdministrativa: z
      .string()
      .trim()
      .max(10000)
      .nullable()
      .optional()
  });

export const comprasProveedorUpdateSchema =
  z
    .object({
      codigoProveedor: z
        .string()
        .trim()
        .min(1)
        .max(160)
        .nullable()
        .optional(),

      estadoOperativo:
        operationalStateSchema.optional(),

      fechaReserva:
        dateStringSchema.optional(),

      fechaConfirmacion:
        dateStringSchema
          .nullable()
          .optional(),

      fechaPrevistaCobro:
        dateStringSchema
          .nullable()
          .optional(),

      tipoCancelacion:
        cancellationTypeSchema
          .nullable()
          .optional(),

      fechaLimiteCancelacion:
        dateStringSchema
          .nullable()
          .optional(),

      fechaRealizacion:
        dateStringSchema
          .nullable()
          .optional(),

      valorContratado: z.coerce
        .number()
        .min(0)
        .nullable()
        .optional(),

      monedaCodigo:
        currencySchema.optional(),

      notaAdministrativa: z
        .string()
        .trim()
        .max(10000)
        .nullable()
        .optional()
    })
    .refine(
      (value) =>
        Object.keys(value).length > 0,
      {
        message:
          "Debes enviar al menos un campo para actualizar"
      }
    );

export const comprasProveedorCancelSchema =
  z.object({
    fechaCancelacion:
      dateStringSchema.optional(),

    motivoCancelacion: z
      .string()
      .trim()
      .min(
        1,
        "El motivo de cancelación es obligatorio"
      )
      .max(500)
  });

export const comprasProveedorReplaceSchema =
  z.object({
    codigoProveedor: z
      .string()
      .trim()
      .min(
        1,
        "El nuevo código es obligatorio"
      )
      .max(160),

    motivoReemplazo: z
      .string()
      .trim()
      .min(
        1,
        "El motivo del reemplazo es obligatorio"
      )
      .max(500),

    estadoOperativo: z
      .enum([
        "SOLICITADA",
        "CONFIRMADA"
      ])
      .default("CONFIRMADA"),

    fechaReserva:
      dateStringSchema.optional(),

    fechaConfirmacion:
      dateStringSchema
        .nullable()
        .optional(),

    fechaPrevistaCobro:
      dateStringSchema
        .nullable()
        .optional(),

    tipoCancelacion:
      cancellationTypeSchema
        .nullable()
        .optional(),

    fechaLimiteCancelacion:
      dateStringSchema
        .nullable()
        .optional(),

    valorContratado: z.coerce
      .number()
      .min(0)
      .nullable()
      .optional(),

    monedaCodigo:
      currencySchema.optional(),

    notaAdministrativa: z
      .string()
      .trim()
      .max(10000)
      .nullable()
      .optional()
  });

const paymentFieldsSchema = z.object({
  tipo:
    paymentTypeSchema.default("PAGO"),

  fechaCargo:
    dateStringSchema.optional(),

  valorMonedaOriginal: z.coerce
    .number()
    .finite(),

  monedaOriginal:
    currencySchema,

  valorCop:
    nullablePositiveNumberSchema,

  tasaCambio:
    nullablePositiveNumberSchema,

  metodoPago: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .optional(),

  referenciaPago: z
    .string()
    .trim()
    .max(180)
    .nullable()
    .optional(),

  nota: z
    .string()
    .trim()
    .max(10000)
    .nullable()
    .optional()
});

export const comprasProveedorPaymentCreateSchema =
  paymentFieldsSchema.superRefine(
    validatePaymentAmount
  );

export const comprasProveedorRefundCreateSchema =
  paymentFieldsSchema
    .omit({
      tipo: true
    })
    .extend({
      tipo: z.literal("REEMBOLSO")
        .default("REEMBOLSO")
    })
    .superRefine(
      validatePaymentAmount
    );

export const comprasProveedorPaymentUpdateSchema =
  paymentFieldsSchema
    .partial()
    .refine(
      (value) =>
        Object.keys(value).length > 0,
      {
        message:
          "Debes enviar al menos un campo para actualizar el movimiento"
      }
    )
    .superRefine(
      validatePaymentAmount
    );

export const comprasProveedorPaymentVoidSchema =
  z.object({
    motivo: z
      .string()
      .trim()
      .min(
        1,
        "El motivo de anulación es obligatorio"
      )
      .max(500)
  });

export type ComprasProveedorCreateInput =
  z.infer<
    typeof comprasProveedorCreateSchema
  >;

export type ComprasProveedorUpdateInput =
  z.infer<
    typeof comprasProveedorUpdateSchema
  >;

export type ComprasProveedorCancelInput =
  z.infer<
    typeof comprasProveedorCancelSchema
  >;

export type ComprasProveedorReplaceInput =
  z.infer<
    typeof comprasProveedorReplaceSchema
  >;

export type ComprasProveedorPaymentCreateInput =
  z.infer<
    typeof comprasProveedorPaymentCreateSchema
  >;

export type ComprasProveedorPaymentUpdateInput =
  z.infer<
    typeof comprasProveedorPaymentUpdateSchema
  >;

export type ComprasProveedorPaymentVoidInput =
  z.infer<
    typeof comprasProveedorPaymentVoidSchema
  >;

const comprasProveedorListOperationalStateSchema = z.enum([
  "BORRADOR",
  "SOLICITADA",
  "CONFIRMADA",
  "CANCELADA",
  "REEMPLAZADA",
  "REALIZADA"
]);

const comprasProveedorFinancialStateSchema = z.enum([
  "SIN_PAGAR",
  "PAGO_PROGRAMADO",
  "PAGO_PARCIAL",
  "PAGADO",
  "FALTA_COP",
  "REEMBOLSADO"
]);

const booleanQuerySchema = z
  .union([
    z.boolean(),
    z.enum(["true", "false"])
  ])
  .transform((value) =>
    typeof value === "boolean"
      ? value
      : value === "true"
  );

export const comprasProveedorListQuerySchema =
  z.object({
    search: z
      .string()
      .trim()
      .max(160)
      .optional(),

    estadoOperativo:
      comprasProveedorListOperationalStateSchema
        .optional(),

    estadoFinanciero:
      comprasProveedorFinancialStateSchema
        .optional(),

    soloVigentes:
      booleanQuerySchema
        .default(true),

    soloPendientes:
      booleanQuerySchema
        .default(false),

    fechaCobroDesde:
      dateStringSchema.optional(),

    fechaCobroHasta:
      dateStringSchema.optional(),

    fechaServicioDesde:
      dateStringSchema.optional(),

    fechaServicioHasta:
      dateStringSchema.optional(),

    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    pageSize: z.coerce
      .number()
      .int()
      .min(10)
      .max(100)
      .default(25)
  });

export type ComprasProveedorListQuery =
  z.infer<
    typeof comprasProveedorListQuerySchema
  >;