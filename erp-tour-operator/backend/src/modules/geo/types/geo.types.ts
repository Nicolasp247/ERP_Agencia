export type ContinenteListItem = {
  id: number;
  nombre: string;
};

export type PaisListItem = {
  id: number;
  nombre: string;
  idContinente: number | null;
};

export type CiudadListItem = {
  id: number;
  nombre: string;
  idPais: number | null;
};