import {
  CiudadListItem,
  ContinenteListItem,
  PaisListItem
} from "../types/geo.types";

export const geoMapper = {
  toContinenteListItem(data: { id: number; nombre: string }): ContinenteListItem {
    return {
      id: data.id,
      nombre: data.nombre
    };
  },

  toPaisListItem(data: {
    id: number;
    nombre: string;
    idContinente: number | null;
  }): PaisListItem {
    return {
      id: data.id,
      nombre: data.nombre,
      idContinente: data.idContinente
    };
  },

  toCiudadListItem(data: {
    id: number;
    nombre: string;
    idPais: number | null;
  }): CiudadListItem {
    return {
      id: data.id,
      nombre: data.nombre,
      idPais: data.idPais
    };
  }
};