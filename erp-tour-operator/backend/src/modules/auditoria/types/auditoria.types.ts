export type AuditPayload = {
  entidad: string;
  entidadId: number;
  accion: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  idUsuario?: number | null;
};
