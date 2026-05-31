/* erp-tour-operator/backend/src/modules/cliente-agente/mapper/cliente-agente.mapper.ts */

import { CotizacionEstado } from "@prisma/client";

export function toClienteAgenteListItem(
  record: {
    id: number;
    codigo: string;
    razonSocial: string;
    nombreContacto: string | null;
    telefono: string | null;
    email: string | null;
    comisionBasePct: { toString(): string } | null;
    activo: boolean;
    pais: { nombre: string } | null;
    ciudad: { nombre: string } | null;
    clientes: { id: number }[];
    cotizaciones: { estado: CotizacionEstado }[];
    reservas: { id: number }[];
  }
) {
  return {
    id: record.id,
    codigo: record.codigo,
    razonSocial: record.razonSocial,
    nombreContacto: record.nombreContacto,
    telefono: record.telefono,
    email: record.email,
    comisionBasePct: record.comisionBasePct?.toString() ?? null,
    activo: record.activo,
    pais: record.pais?.nombre ?? null,
    ciudad: record.ciudad?.nombre ?? null,
    cantidadClientes: record.clientes.length,
    cantidadCotizacionesActivas: record.cotizaciones.filter((item) => item.estado === CotizacionEstado.ACTIVA)
      .length,
    cantidadReservas: record.reservas.length
  };
}

export function toClienteAgenteDetail(
  record: {
    id: number;
    codigo: string;
    razonSocial: string;
    nombreContacto: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    nit: string | null;
    comisionBasePct: { toString(): string } | null;
    activo: boolean;
    pais:
      | {
          id: number;
          nombre: string;
          continente?: {
            id: number;
            nombre: string;
          } | null;
        }
      | null;
    ciudad: { id: number; nombre: string } | null;
    clientes: Array<{ id: number; nombreCompleto: string; activo: boolean }>;
    cotizaciones: Array<{
      id: number;
      nombreCotizacion: string;
      estado: string;
      fechaViajePrincipal: Date;
    }>;
    reservas: Array<{
      id: number;
      codigoReserva: string;
      estado: string;
      fechaViajePrincipal: Date;
    }>;
    comisiones?: Array<{
      tipoComision: string;
      porcentajeAgente: { toString(): string };
      porcentajeWtravel: { toString(): string };
      porcentajeBancario: { toString(): string };
      activo: boolean;
    }>;
  }
) {
  return {
    id: record.id,
    codigo: record.codigo,
    razonSocial: record.razonSocial,
    nombreContacto: record.nombreContacto,
    telefono: record.telefono,
    email: record.email,
    direccion: record.direccion,
    nit: record.nit,
    comisionBasePct: record.comisionBasePct?.toString() ?? null,
    activo: record.activo,
    continente: record.pais?.continente ?? null,
    pais: record.pais
      ? {
          id: record.pais.id,
          nombre: record.pais.nombre
        }
      : null,
    ciudad: record.ciudad,
    comisiones: (record.comisiones ?? []).map((commission) => ({
      tipoComision: commission.tipoComision,
      porcentajeAgente: commission.porcentajeAgente.toString(),
      porcentajeWtravel: commission.porcentajeWtravel.toString(),
      porcentajeBancario: commission.porcentajeBancario.toString(),
      activo: commission.activo
    })),
    clientes: record.clientes,
    cotizaciones: record.cotizaciones,
    reservas: record.reservas
  };
}
