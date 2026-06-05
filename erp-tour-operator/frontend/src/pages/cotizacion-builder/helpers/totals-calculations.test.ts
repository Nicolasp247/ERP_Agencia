/* erp-tour-operator/frontend/src/pages/cotizacion-builder/helpers/totals-calculations.test.ts */

import { describe, expect, it } from "vitest";

import type {
  BuilderColumn,
  BuilderCommission,
  BuilderRow
} from "../types/cotizacion-builder.types";
import {
  buildSummaryColumn,
  buildSummaryColumns,
  evaluateFormula,
  getTotalMultiplier,
  roundUpToNextFive
} from "./totals-calculations";

function makeColumn(overrides: Partial<BuilderColumn> = {}): BuilderColumn {
  return {
    id: 1,
    grupo: "Turista",
    nombre: "Doble",
    tipo: "TERRESTRE",
    unidad: "POR_PERSONA",
    multiplicador: 1,
    precioMostradoFormula: null,
    precioMostradoValor: null,
    orden: 1,
    ...overrides
  };
}

function makeRow(overrides: Partial<BuilderRow> = {}): BuilderRow {
  return {
    id: 1,
    idServicio: 1,
    fecha: "2026-05-28",
    fechaFin: "2026-05-29",
    ordenDia: 1,
    servicioIncluido: "Alojamiento 1 noche",
    operador: "CVT",
    linkReserva: null,
    notas: "",
    esOpcional: false,
    tipoServicio: "Alojamiento",
    tipoServicioCodigo: "ALOJAMIENTO",
    ciudadNombre: "Madrid",
    paisNombre: "España",
    precios: [
      {
        columnId: 1,
        precioNeto: 1000
      }
    ],
    hotelesPrevistos: [],
    ...overrides
  };
}

function makeCommission(overrides: Partial<BuilderCommission> = {}): BuilderCommission {
  return {
    id: 1,
    tipoComision: "TERRESTRE",
    porcentajeAgente: 12,
    porcentajeWtravel: 13,
    porcentajeBancario: 5,
    porcentajeTotal: 30,
    factorVenta: 0.7,
    ...overrides
  };
}

describe("roundUpToNextFive", () => {
  it("redondea hacia arriba al siguiente multiplo de 5", () => {
    expect(roundUpToNextFive(1357.14)).toBe(1360);
    expect(roundUpToNextFive(1355)).toBe(1355);
    expect(roundUpToNextFive(1355.01)).toBe(1360);
    expect(roundUpToNextFive(0)).toBe(0);
  });

  it("devuelve 0 cuando el valor no es numerico", () => {
    expect(roundUpToNextFive(Number.NaN)).toBe(0);
    expect(roundUpToNextFive(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("evaluateFormula", () => {
  it("calcula formulas tipo Excel que empiezan con igual", () => {
    expect(evaluateFormula("=1350+20", 0)).toBe(1370);
    expect(evaluateFormula("=1000/2+50", 0)).toBe(550);
    expect(evaluateFormula("=(1000+500)/3", 0)).toBe(500);
  });

  it("calcula numeros escritos sin igual", () => {
    expect(evaluateFormula("1500", 0)).toBe(1500);
    expect(evaluateFormula("1500 USD", 0)).toBe(1500);
    expect(evaluateFormula("1500,5", 0)).toBe(1500.5);
  });

  it("usa fallback cuando la formula esta vacia o es invalida", () => {
    expect(evaluateFormula("", 999)).toBe(999);
    expect(evaluateFormula("=hola+20", 999)).toBe(999);
    expect(evaluateFormula("=1000+", 999)).toBe(999);
  });
});

describe("getTotalMultiplier", () => {
  it("multiplica por pasajeros cuando la unidad es POR_PERSONA", () => {
    const column = makeColumn({
      unidad: "POR_PERSONA",
      multiplicador: 1
    });

    expect(getTotalMultiplier(column, 3)).toBe(3);
  });

  it("multiplica por pasajeros cuando la unidad es POR_NINO", () => {
    const column = makeColumn({
      unidad: "POR_NINO",
      multiplicador: 1
    });

    expect(getTotalMultiplier(column, 3)).toBe(3);
  });

  it("calcula habitaciones con ceil(totalPasajeros / multiplicador)", () => {
    const column = makeColumn({
      unidad: "POR_HABITACION",
      multiplicador: 2
    });

    expect(getTotalMultiplier(column, 4)).toBe(2);
    expect(getTotalMultiplier(column, 5)).toBe(3);
  });

  it("usa multiplicador 1 para POR_GRUPO", () => {
    const column = makeColumn({
      unidad: "POR_GRUPO",
      multiplicador: 1
    });

    expect(getTotalMultiplier(column, 10)).toBe(1);
  });
});

describe("buildSummaryColumn", () => {
  it("calcula costo, precio, mostrado y total de grupo para POR_PERSONA", () => {
    const column = makeColumn({
      id: 1,
      unidad: "POR_PERSONA",
      multiplicador: 1
    });

    const row = makeRow({
      precios: [
        {
          columnId: 1,
          precioNeto: 1000
        }
      ]
    });

    const summary = buildSummaryColumn(
      column,
      [makeCommission({ factorVenta: 0.7 })],
      [row],
      3,
      {}
    );

    expect(summary.costo).toBe(1000);
    expect(summary.precio).toBeCloseTo(1428.57, 2);
    expect(summary.mostradoAutomatico).toBe(1430);
    expect(summary.mostrado).toBe(1430);
    expect(summary.totalGrupo).toBe(4290);
    expect(summary.mostradoEsMenorAlPrecio).toBe(false);
  });

  it("calcula total de grupo para POR_HABITACION", () => {
    const column = makeColumn({
      id: 1,
      unidad: "POR_HABITACION",
      multiplicador: 2
    });

    const row = makeRow({
      precios: [
        {
          columnId: 1,
          precioNeto: 700
        }
      ]
    });

    const summary = buildSummaryColumn(
      column,
      [makeCommission({ factorVenta: 0.7 })],
      [row],
      4,
      {
        1: "=1000"
      }
    );

    expect(summary.mostrado).toBe(1000);
    expect(summary.totalGrupo).toBe(2000);
  });

  it("calcula total de grupo para POR_GRUPO sin multiplicar por pasajeros", () => {
    const column = makeColumn({
      id: 1,
      unidad: "POR_GRUPO",
      multiplicador: 1
    });

    const row = makeRow({
      precios: [
        {
          columnId: 1,
          precioNeto: 700
        }
      ]
    });

    const summary = buildSummaryColumn(
      column,
      [makeCommission({ factorVenta: 0.7 })],
      [row],
      10,
      {
        1: "=1000"
      }
    );

    expect(summary.mostrado).toBe(1000);
    expect(summary.totalGrupo).toBe(1000);
  });

  it("marca alerta cuando mostrado es menor al precio calculado", () => {
    const column = makeColumn({
      id: 1,
      unidad: "POR_PERSONA"
    });

    const row = makeRow({
      precios: [
        {
          columnId: 1,
          precioNeto: 1000
        }
      ]
    });

    const summary = buildSummaryColumn(
      column,
      [makeCommission({ factorVenta: 0.7 })],
      [row],
      3,
      {
        1: "=1200"
      }
    );

    expect(summary.precio).toBeCloseTo(1428.57, 2);
    expect(summary.mostrado).toBe(1200);
    expect(summary.mostradoEsMenorAlPrecio).toBe(true);
  });

  it("no marca alerta cuando mostrado es igual o mayor al precio calculado", () => {
    const column = makeColumn({
      id: 1,
      unidad: "POR_PERSONA"
    });

    const row = makeRow({
      precios: [
        {
          columnId: 1,
          precioNeto: 1000
        }
      ]
    });

    const summary = buildSummaryColumn(
      column,
      [makeCommission({ factorVenta: 0.7 })],
      [row],
      3,
      {
        1: "=1430"
      }
    );

    expect(summary.mostradoEsMenorAlPrecio).toBe(false);
  });
});

describe("buildSummaryColumns", () => {
  it("excluye columnas opcionales y filas opcionales de TotalsPanel", () => {
    const terrestrialColumn = makeColumn({
      id: 1,
      tipo: "TERRESTRE",
      unidad: "POR_PERSONA"
    });

    const optionalColumn = makeColumn({
      id: 2,
      grupo: "General",
      nombre: "Adulto",
      tipo: "OPCIONALES",
      unidad: "POR_PERSONA"
    });

    const normalRow = makeRow({
      id: 1,
      esOpcional: false,
      precios: [
        {
          columnId: 1,
          precioNeto: 1000
        },
        {
          columnId: 2,
          precioNeto: 200
        }
      ]
    });

    const optionalRow = makeRow({
      id: 2,
      esOpcional: true,
      precios: [
        {
          columnId: 1,
          precioNeto: 9999
        },
        {
          columnId: 2,
          precioNeto: 200
        }
      ]
    });

    const summaries = buildSummaryColumns({
      columns: [terrestrialColumn, optionalColumn],
      comisiones: [makeCommission({ factorVenta: 0.7 })],
      rows: [normalRow, optionalRow],
      totalPasajeros: 3,
      mostradoInputs: {}
    });

    expect(summaries).toHaveLength(1);
    expect(summaries[0].column.id).toBe(1);
    expect(summaries[0].costo).toBe(1000);
  });
});