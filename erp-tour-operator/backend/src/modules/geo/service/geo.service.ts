import { geoMapper } from "../mapper/geo.mapper";
import { geoRepository } from "../repository/geo.repository";

export const geoService = {
  async listContinentes() {
    const continentes = await geoRepository.findContinentes();
    return continentes.map(geoMapper.toContinenteListItem);
  },

  async listPaises(idContinente?: number) {
    const paises = await geoRepository.findPaises(idContinente);
    return paises.map(geoMapper.toPaisListItem);
  },

  async listCiudades(idPais?: number) {
    const ciudades = await geoRepository.findCiudades(idPais);
    return ciudades.map(geoMapper.toCiudadListItem);
  }
};