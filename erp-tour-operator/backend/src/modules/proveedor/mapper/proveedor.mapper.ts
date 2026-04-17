export function toProveedorListItem(
  record: {
    id: number;
    codigo: string | null;
    nombreComercial: string;
    activo: boolean;
    pais: { nombre: string } | null;
    ciudad: { nombre: string } | null;
    servicios: Array<{
      activo: boolean;
      tipo: {
        nombre: string;
      };
    }>;
  }
) {
  const tiposServicio = Array.from(new Set(record.servicios.map((item) => item.tipo.nombre))).sort();

  return {
    id: record.id,
    codigo: record.codigo,
    nombreComercial: record.nombreComercial,
    pais: record.pais?.nombre ?? null,
    ciudad: record.ciudad?.nombre ?? null,
    tiposServicio,
    cantidadServiciosActivos: record.servicios.filter((item) => item.activo).length,
    activo: record.activo
  };
}

export function toProveedorDetail(
  record: {
    id: number;
    codigo: string | null;
    nombreComercial: string;
    sitioWeb: string | null;
    observaciones: string | null;
    activo: boolean;
    pais: { id: number; nombre: string } | null;
    ciudad: { id: number; nombre: string } | null;
    contactos: Array<{
      id: number;
      nombreContacto: string | null;
      email: string;
      telefono: string | null;
      cargo: string | null;
      principal: boolean;
      activo: boolean;
    }>;
    servicios: Array<{
      id: number;
      nombreWtravel: string;
      activo: boolean;
      tipo: { nombre: string };
    }>;
  }
) {
  return {
    id: record.id,
    codigo: record.codigo,
    nombreComercial: record.nombreComercial,
    sitioWeb: record.sitioWeb,
    observaciones: record.observaciones,
    activo: record.activo,
    pais: record.pais,
    ciudad: record.ciudad,
    contactos: record.contactos,
    servicios: record.servicios.map((service) => ({
      id: service.id,
      nombre: service.nombreWtravel,
      activo: service.activo,
      tipo: service.tipo.nombre
    }))
  };
}
