export type ProveedorListItem = {
  id: number;
  codigo: string | null;
  nombreComercial: string;
  pais: string | null;
  ciudad: string | null;
  tiposServicio: string[];
  cantidadServiciosActivos: number;
  activo: boolean;
};
