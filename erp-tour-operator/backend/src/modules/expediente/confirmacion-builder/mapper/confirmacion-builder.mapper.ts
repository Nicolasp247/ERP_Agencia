/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/mapper/confirmacion-builder.mapper.ts */

import { formatDateOnly } from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-date.mapper";

import {
  mapConfirmacionColumns,
  mapConfirmacionOptionColumns
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-column.mapper";

import {
  getReservaFechaFinViaje,
  mapConfirmacionPassengers
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-passenger.mapper";

import { mapConfirmacionRows } from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-row.mapper";

export function toConfirmacionBuilderOptions(
  record: any
) {
  return {
    version: {
      id:
        record.id,

      idExpediente:
        record.idExpediente,

      versionNumero:
        record.versionNumero,

      versionCodigo:
        record.versionCodigo,

      estadoVersion:
        record.estadoVersion,

      nombreCotizacion:
        record.nombreCotizacion,

      monedaCodigo:
        record.monedaCodigo
    },

    expediente: {
      id:
        record.expediente.id,

      codigo:
        record.expediente.codigo,

      nombreExpediente:
        record.expediente
          .nombreExpediente,

      cliente:
        record.expediente.cliente,

      clienteAgente:
        record.expediente
          .clienteAgente,

      destinoPrincipal:
        record.expediente
          .destinoPrincipal
    },

    columns:
      mapConfirmacionOptionColumns(
        record
      )
  };
}

export function toConfirmacionBuilderDetail(
  record: any
) {
  const columns =
    mapConfirmacionColumns(record);

  const rows =
    mapConfirmacionRows(
      record,
      columns
    );

  const fechaInicioViaje =
    formatDateOnly(
      record.fechaViajePrincipal
    );

  const fechaFinViaje =
    getReservaFechaFinViaje(
      record
    );

  const pasajeros =
    mapConfirmacionPassengers(
      record,
      fechaInicioViaje,
      fechaFinViaje
    );

  return {
    reserva: {
      id:
        record.id,

      codigoReserva:
        record.codigoReserva,

      estado:
        record.estado,

      confirmacionComercialEstado:
        record
          .confirmacionComercialEstado,

      monedaCodigo:
        record.monedaCodigo,

      totalPasajeros:
        record.totalPasajeros,

      fechaViajePrincipal:
        fechaInicioViaje,

      fechaFinViaje,

      nota:
        record.nota ?? ""
    },

    version: {
      id:
        record.cotizacionOrigen.id,

      idExpediente:
        record.cotizacionOrigen
          .idExpediente,

      versionNumero:
        record.cotizacionOrigen
          .versionNumero,

      versionCodigo:
        record.cotizacionOrigen
          .versionCodigo,

      estadoVersion:
        record.cotizacionOrigen
          .estadoVersion,

      nombreCotizacion:
        record.cotizacionOrigen
          .nombreCotizacion
    },

    expediente: {
      id:
        record.cotizacionOrigen
          .expediente.id,

      codigo:
        record.cotizacionOrigen
          .expediente.codigo,

      nombreExpediente:
        record.cotizacionOrigen
          .expediente
          .nombreExpediente,

      estado:
        record.cotizacionOrigen
          .expediente.estado,

      cliente:
        record.cotizacionOrigen
          .expediente.cliente,

      clienteAgente:
        record.cotizacionOrigen
          .expediente
          .clienteAgente,

      destinoPrincipal:
        record.cotizacionOrigen
          .expediente
          .destinoPrincipal
    },

    columns,
    pasajeros,

    rows:
      rows.filter(
        (item: any) =>
          !item.esOpcional
      ),

    optionalRows:
      rows.filter(
        (item: any) =>
          item.esOpcional
      )
  };
}