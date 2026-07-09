/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/mapper/confirmacion-builder.mapper.ts */

function formatDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function parseDateOnly(value: Date | string | null | undefined) {
  if (!value) return null;

  const raw = value instanceof Date ? formatDateOnly(value) : String(value).slice(0, 10);
  const date = new Date(`${raw}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function calculateAgeAtDate(birthValue: Date | string | null | undefined, targetValue: Date | string | null | undefined) {
  const birth = parseDateOnly(birthValue);
  const target = parseDateOnly(targetValue);

  if (!birth || !target) {
    return null;
  }

  let age = target.getUTCFullYear() - birth.getUTCFullYear();

  const targetMonth = target.getUTCMonth();
  const birthMonth = birth.getUTCMonth();
  const targetDay = target.getUTCDate();
  const birthDay = birth.getUTCDate();

  if (targetMonth < birthMonth || (targetMonth === birthMonth && targetDay < birthDay)) {
    age -= 1;
  }

  return age;
}

function getReservaFechaFinViaje(record: any) {
  const start = formatDateOnly(record.fechaViajePrincipal);

  let latest = parseDateOnly(start);

  for (const item of record.items ?? []) {
    const itemEnd = isAlojamientoItem(item)
      ? parseDateOnly(getFechaFinAlojamiento(item))
      : parseDateOnly(item.fechaServicio);

    if (!itemEnd) {
      continue;
    }

    if (!latest || itemEnd.getTime() > latest.getTime()) {
      latest = itemEnd;
    }
  }

  return latest ? formatDateOnly(latest) : start;
}

function formatPassengerTravelAge(passenger: any, fechaInicioViaje: string | null, fechaFinViaje: string | null) {
  const startAge = calculateAgeAtDate(passenger.fechaNacimiento, fechaInicioViaje);
  const endAge = calculateAgeAtDate(passenger.fechaNacimiento, fechaFinViaje);

  if (startAge === null || endAge === null) {
    return "N/D";
  }

  if (startAge === endAge) {
    return String(startAge);
  }

  return `${startAge}/${endAge}`;
}

function addDaysToDate(value: Date | string | null | undefined, days: number) {
  if (!value) return null;

  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(0, 0, 0, 0);

  return formatDateOnly(date);
}

function getTipoServicioNombre(item: any) {
  return item.servicio?.tipo?.nombre ?? "";
}

function getTipoServicioCodigo(item: any) {
  return item.servicio?.tipo?.codigo ?? null;
}

function isAlojamientoItem(item: any) {
  const tipoNombre = String(getTipoServicioNombre(item)).trim().toLowerCase();
  const tipoCodigo = String(getTipoServicioCodigo(item) ?? "").trim().toLowerCase();

  return tipoNombre === "alojamiento" || tipoCodigo === "alojamiento";
}

function getFechaFinAlojamiento(item: any) {
  const noches = Number(item.cotizacionItemOrigen?.alojamientoDetalle?.noches ?? 1);
  return addDaysToDate(item.fechaServicio, noches);
}

function getServicioIncluido(item: any) {
  if (item.tituloSnapshot) {
    return item.tituloSnapshot;
  }

  return item.servicio?.nombreWtravel || "Servicio sin nombre";
}

function getColumnLabel(column: any) {
  return `${column.grupoSnapshot} ${column.nombreSnapshot}`
    .replaceAll("*", " estrellas")
    .replace(/\s+/g, " ")
    .trim();
}

export function toConfirmacionBuilderOptions(record: any) {
  return {
    version: {
      id: record.id,
      idExpediente: record.idExpediente,
      versionNumero: record.versionNumero,
      versionCodigo: record.versionCodigo,
      estadoVersion: record.estadoVersion,
      nombreCotizacion: record.nombreCotizacion,
      monedaCodigo: record.monedaCodigo
    },
    expediente: {
      id: record.expediente.id,
      codigo: record.expediente.codigo,
      nombreExpediente: record.expediente.nombreExpediente,
      cliente: record.expediente.cliente,
      clienteAgente: record.expediente.clienteAgente,
      destinoPrincipal: record.expediente.destinoPrincipal
    },
    columns: (record.columnas ?? [])
      .filter((column: any) => column.activo)
      .map((column: any) => ({
        id: column.id,
        grupo: column.grupo,
        nombre: column.nombre,
        tipo: column.tipo,
        unidad: column.unidad,
        multiplicador: column.multiplicador,
        orden: column.orden,
        label: `${column.grupo} ${column.nombre}`.replace(/\s+/g, " ").trim()
      }))
  };
}

export function toConfirmacionBuilderDetail(record: any) {
  const columns = (record.columnasSeleccionadas ?? []).map((column: any) => ({
    id: column.id,
    idCotizacionColumnaOrigen: column.idCotizacionColumnaOrigen,
    grupo: column.grupoSnapshot,
    nombre: column.nombreSnapshot,
    tipo: column.tipoSnapshot,
    unidad: column.unidadSnapshot,
    multiplicador: column.multiplicadorSnapshot,
    precioMostradoFormula: column.precioMostradoFormulaSnapshot ?? null,
    precioMostradoValor:
      column.precioMostradoValorSnapshot === null || column.precioMostradoValorSnapshot === undefined
        ? null
        : Number(column.precioMostradoValorSnapshot),
    orden: column.orden,
    label: getColumnLabel(column)
  }));

  const rows = (record.items ?? []).map((item: any) => ({
    id: item.id,
    idServicio: item.idServicio,
    idCotizacionItemOrigen: item.idCotizacionItemOrigen,
    fecha: formatDateOnly(item.fechaServicio),
    fechaFin: isAlojamientoItem(item)
      ? getFechaFinAlojamiento(item)
      : formatDateOnly(item.fechaServicio),
    ordenDia: item.ordenDia,
    servicioIncluido: getServicioIncluido(item),
    operador:
      item.servicio?.proveedor?.codigo ||
      item.servicio?.proveedor?.nombreComercial ||
      "N/D",
    linkReserva: item.servicio?.linkReserva ?? null,
    notas: item.notaLineaSnapshot ?? "",
    esOpcional: item.esOpcional,
    tipoServicio: getTipoServicioNombre(item),
    tipoServicioCodigo: getTipoServicioCodigo(item),
    ciudadNombre: item.servicio?.ciudad?.nombre ?? null,
    paisNombre: item.servicio?.ciudad?.pais?.nombre ?? null,
    precios: columns.map((column: any) => {
      const price = item.preciosSeleccionados?.find(
        (currentPrice: any) => currentPrice.idReservaColumnaSeleccionada === column.id
      );

      return {
        columnId: column.id,
        precioCotizado:
          price?.precioCotizado === null || price?.precioCotizado === undefined
            ? null
            : Number(price.precioCotizado),
        precioConfirmado:
          price?.precioConfirmado === null || price?.precioConfirmado === undefined
            ? null
            : Number(price.precioConfirmado)
      };
    }),
    hotelesPrevistos: columns.map((column: any) => {
      const hotel = item.hotelesPrevistosSeleccionados?.find(
        (currentHotel: any) => currentHotel.idReservaColumnaSeleccionada === column.id
      );

      return {
        columnId: column.id,
        textoHotel: hotel?.textoHotel ?? ""
      };
    })
  }));

  const fechaInicioViaje = formatDateOnly(record.fechaViajePrincipal);
  const fechaFinViaje = getReservaFechaFinViaje(record);

  const pasajeros = (record.pasajeros ?? []).map((passenger: any) => ({
    id: passenger.id,
    idReserva: passenger.idReserva,
    orden: passenger.orden,
    nombre: passenger.nombre,
    apellidos: passenger.apellidos,
    fechaNacimiento: formatDateOnly(passenger.fechaNacimiento),
    edadEnViaje: formatPassengerTravelAge(passenger, fechaInicioViaje, fechaFinViaje),
    numeroPasaporte: passenger.numeroPasaporte,
    fechaExpedicionPasaporte: formatDateOnly(passenger.fechaExpedicionPasaporte),
    fechaVencimientoPasaporte: formatDateOnly(passenger.fechaVencimientoPasaporte),
    nacionalidad: passenger.nacionalidad,
    createdAt: passenger.createdAt,
    updatedAt: passenger.updatedAt
  }));

  return {
    reserva: {
      id: record.id,
      codigoReserva: record.codigoReserva,
      estado: record.estado,
      confirmacionComercialEstado: record.confirmacionComercialEstado,
      monedaCodigo: record.monedaCodigo,
      totalPasajeros: record.totalPasajeros,
      fechaViajePrincipal: formatDateOnly(record.fechaViajePrincipal),
      fechaFinViaje,
      nota: record.nota ?? ""
    },
    version: {
      id: record.cotizacionOrigen.id,
      idExpediente: record.cotizacionOrigen.idExpediente,
      versionNumero: record.cotizacionOrigen.versionNumero,
      versionCodigo: record.cotizacionOrigen.versionCodigo,
      estadoVersion: record.cotizacionOrigen.estadoVersion,
      nombreCotizacion: record.cotizacionOrigen.nombreCotizacion
    },
    expediente: {
      id: record.cotizacionOrigen.expediente.id,
      codigo: record.cotizacionOrigen.expediente.codigo,
      nombreExpediente: record.cotizacionOrigen.expediente.nombreExpediente,
      estado: record.cotizacionOrigen.expediente.estado,
      cliente: record.cotizacionOrigen.expediente.cliente,
      clienteAgente: record.cotizacionOrigen.expediente.clienteAgente,
      destinoPrincipal: record.cotizacionOrigen.expediente.destinoPrincipal
    },
    columns,
    pasajeros,
    rows: rows.filter((item: any) => !item.esOpcional),
    optionalRows: rows.filter((item: any) => item.esOpcional)
  };
}