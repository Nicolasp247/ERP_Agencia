// erp-tour-operator/backend/src/modules/contabilidad/compras-proveedor/repository/compras-proveedor-create.repository.ts

import { formatDateOnly } from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-date.mapper";

import {
  getFechaFinAlojamiento,
  getServicioIncluido,
  getTipoServicioCodigo,
  getTipoServicioNombre,
  isAlojamientoItem
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-service.mapper";

import {
  mapLegacyCompraProveedor,
  mapNuevaReservaProveedor
} from "@/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-purchase.mapper";

function mapPrices(
  item: any,
  columns: any[]
) {
  return columns.map(
    (column: any) => {
      const price =
        item.preciosSeleccionados?.find(
          (currentPrice: any) =>
            currentPrice
              .idReservaColumnaSeleccionada ===
            column.id
        );

      return {
        columnId:
          column.id,

        precioCotizado:
          price?.precioCotizado ===
            null ||
          price?.precioCotizado ===
            undefined
            ? null
            : Number(
                price.precioCotizado
              ),

        precioConfirmado:
          price?.precioConfirmado ===
            null ||
          price?.precioConfirmado ===
            undefined
            ? null
            : Number(
                price.precioConfirmado
              )
      };
    }
  );
}

function mapHotels(
  item: any,
  columns: any[]
) {
  return columns.map(
    (column: any) => {
      const hotel =
        item
          .hotelesPrevistosSeleccionados
          ?.find(
            (currentHotel: any) =>
              currentHotel
                .idReservaColumnaSeleccionada ===
              column.id
          );

      return {
        columnId:
          column.id,

        textoHotel:
          hotel?.textoHotel ?? ""
      };
    }
  );
}

export function mapConfirmacionRows(
  record: any,
  columns: any[]
) {
  return (
    record.items ?? []
  ).map((item: any) => ({
    id:
      item.id,

    idServicio:
      item.idServicio,

    idCotizacionItemOrigen:
      item.idCotizacionItemOrigen,

    fecha:
      formatDateOnly(
        item.fechaServicio
      ),

    fechaFin:
      isAlojamientoItem(item)
        ? getFechaFinAlojamiento(item)
        : formatDateOnly(
            item.fechaServicio
          ),

    ordenDia:
      item.ordenDia,

    servicioIncluido:
      getServicioIncluido(item),

    operador:
      item.servicio?.proveedor?.codigo ||
      item.servicio?.proveedor
        ?.nombreComercial ||
      "N/D",

    compraProveedor:
      mapNuevaReservaProveedor(item) ??
      mapLegacyCompraProveedor(item),

    linkReserva:
      item.servicio?.linkReserva ?? null,

    notas:
      item.notaLineaSnapshot ?? "",

    esOpcional:
      item.esOpcional,

    tipoServicio:
      getTipoServicioNombre(item),

    tipoServicioCodigo:
      getTipoServicioCodigo(item),

    ciudadNombre:
      item.servicio?.ciudad?.nombre ??
      null,

    paisNombre:
      item.servicio?.ciudad?.pais
        ?.nombre ?? null,

    precios:
      mapPrices(
        item,
        columns
      ),

    hotelesPrevistos:
      mapHotels(
        item,
        columns
      )
  }));
}