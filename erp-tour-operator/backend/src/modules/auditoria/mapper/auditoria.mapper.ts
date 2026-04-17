export function toAuditEventResponse<
  T extends {
    id: number;
    entidad: string;
    entidadId: number;
    accion: string;
    valorAnterior: unknown;
    valorNuevo: unknown;
    fechaEvento: Date;
    idUsuario: number | null;
  }
>(event: T) {
  return {
    id: event.id,
    entidad: event.entidad,
    entidadId: event.entidadId,
    accion: event.accion,
    valorAnterior: event.valorAnterior,
    valorNuevo: event.valorNuevo,
    fechaEvento: event.fechaEvento,
    idUsuario: event.idUsuario
  };
}
