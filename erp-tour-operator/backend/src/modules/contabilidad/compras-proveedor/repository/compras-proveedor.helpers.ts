// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/dto/compras-proveedor.dto.ts

import { randomUUID } from "node:crypto";

export const PURCHASE_COLUMN_TYPES = [
  "TERRESTRE",
  "TRANSPORTE",
  "OPCIONALES",
  "OTRO"
] as const;

export type ColumnType =
  (typeof PURCHASE_COLUMN_TYPES)[number];

export type PurchaseColumnCandidate = {
  id: number;
  tipo: ColumnType;
  orden: number;
};

export function toColumnType(
  value: unknown
): ColumnType {
  const normalized = String(
    value ?? ""
  )
    .trim()
    .toUpperCase();

  if (
    PURCHASE_COLUMN_TYPES.includes(
      normalized as ColumnType
    )
  ) {
    return normalized as ColumnType;
  }

  return "OTRO";
}

export function todayIsoDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toDateOnly(
  value: string | Date
) {
  const raw =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : value.slice(0, 10);

  return new Date(
    `${raw}T00:00:00.000Z`
  );
}

export function buildProviderBookingCode(
  reservaId: number,
  itemId: number
) {
  const year =
    new Date().getUTCFullYear();

  const suffix = randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();

  return [
    "PR",
    year,
    String(reservaId).padStart(6, "0"),
    String(itemId).padStart(6, "0"),
    suffix
  ].join("-");
}

function normalizeText(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function getPreferredColumnType(
  serviceTypeName:
    | string
    | null
    | undefined,
  serviceTypeCode:
    | string
    | null
    | undefined,
  esOpcional: boolean
): ColumnType {
  if (esOpcional) {
    return "OPCIONALES";
  }

  const normalized = [
    normalizeText(serviceTypeName),
    normalizeText(serviceTypeCode)
  ].join(" ");

  if (
    normalized.includes("vuelo") ||
    normalized.includes("tren") ||
    normalized.includes("barco") ||
    normalized.includes("ferry") ||
    normalized.includes("crucero")
  ) {
    return "TRANSPORTE";
  }

  if (normalized.includes("otro")) {
    return "OTRO";
  }

  return "TERRESTRE";
}

export function selectApplicableColumn(
  candidates: PurchaseColumnCandidate[],
  preferredType: ColumnType
) {
  if (!candidates.length) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const preferred = candidates
    .filter(
      (candidate) =>
        candidate.tipo === preferredType
    )
    .sort(
      (left, right) =>
        left.orden - right.orden
    );

  if (preferred.length) {
    return preferred[0];
  }

  return [...candidates].sort(
    (left, right) =>
      left.orden - right.orden
  )[0];
}

function formatDate(
  value:
    | Date
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function formatDecimal(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function buildBookingSnapshot(
  record: any
) {
  return {
    id: record.id,

    codigoInterno:
      record.codigoInterno,

    codigoProveedor:
      record.codigoProveedor ?? null,

    estadoOperativo:
      record.estadoOperativo,

    estadoFinanciero:
      record.estadoFinanciero,

    esVigente:
      Boolean(record.esVigente),

    fechaReserva:
      formatDate(record.fechaReserva),

    fechaConfirmacion:
      formatDate(
        record.fechaConfirmacion
      ),

    fechaPrevistaCobro:
      formatDate(
        record.fechaPrevistaCobro
      ),

    fechaLimiteCancelacion:
      formatDate(
        record.fechaLimiteCancelacion
      ),

    fechaCancelacion:
      formatDate(
        record.fechaCancelacion
      ),

    fechaRealizacion:
      formatDate(
        record.fechaRealizacion
      ),

    tipoCancelacion:
      record.tipoCancelacion ?? null,

    valorContratado:
      formatDecimal(
        record.valorContratado
      ),

    monedaCodigo:
      record.monedaCodigo,

    motivoCancelacion:
      record.motivoCancelacion ?? null,

    notaAdministrativa:
      record.notaAdministrativa ?? null
  };
}