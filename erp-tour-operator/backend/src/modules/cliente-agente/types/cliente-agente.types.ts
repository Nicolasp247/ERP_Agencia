export type ClienteAgenteSummary = {
  id: number;
  codigo: string;
  razonSocial: string;
  nombreContacto: string | null;
  telefono: string | null;
  email: string | null;
  comisionBasePct: string | null;
  activo: boolean;
  pais: string | null;
  ciudad: string | null;
  cantidadClientes: number;
  cantidadCotizacionesActivas: number;
  cantidadReservas: number;
};
