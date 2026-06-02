/* erp-tour-operator/backend/src/modules/cotizacion-builder/repository/cotizacion-builder.constants.ts */

import {
  CotizacionColumnaTipo,
  CotizacionColumnaUnidad,
  Prisma,
  TipoComisionCotizacion
} from "@prisma/client";

export const DEFAULT_COLUMNS = [
  {
    grupo: "Turista (3*)",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.TERRESTRE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 2,
    orden: 1
  },
  {
    grupo: "Lujo (5*)",
    nombre: "Doble",
    tipo: CotizacionColumnaTipo.TERRESTRE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 2,
    orden: 2
  },
  {
    grupo: "Económica",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.TRANSPORTE,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 1,
    orden: 3
  },
  {
    grupo: "General",
    nombre: "Adulto",
    tipo: CotizacionColumnaTipo.OPCIONALES,
    unidad: CotizacionColumnaUnidad.POR_PERSONA,
    multiplicador: 1,
    orden: 4
  }
];

export const DEFAULT_COMMISSION_RULES = [
  {
    tipoComision: TipoComisionCotizacion.TERRESTRE,
    porcentajeAgente: new Prisma.Decimal(12),
    porcentajeWtravel: new Prisma.Decimal(13),
    porcentajeBancario: new Prisma.Decimal(5)
  },
  {
    tipoComision: TipoComisionCotizacion.AEREA,
    porcentajeAgente: new Prisma.Decimal(5),
    porcentajeWtravel: new Prisma.Decimal(5),
    porcentajeBancario: new Prisma.Decimal(5)
  }
];