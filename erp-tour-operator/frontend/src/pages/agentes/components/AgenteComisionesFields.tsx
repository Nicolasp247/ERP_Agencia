/* erp-tour-operator/frontend/src/pages/agentes/components/AgenteComisionesFields.tsx */

import type { UseFormReturn } from "react-hook-form";
import type { AgenteFormValues } from "@/modules/cliente-agente/cliente-agente-api";

type Props = {
  form: UseFormReturn<AgenteFormValues>;
};

/**
 * Bloque visual del formulario para editar las reglas base de comisión del agente.
 *
 * Cada agente tiene dos reglas:
 * - TERRESTRE: se usa para servicios terrestres.
 * - AEREA: se usa para servicios aéreos.
 *
 * Cada regla guarda tres porcentajes:
 * - porcentaje del agente
 * - porcentaje de WTravel
 * - porcentaje bancario
 */
export function AgenteComisionesFields({ form }: Props) {
  return (
    <div className="stack agente-commissions">
      <div className="stack agente-commissions-header">
        <h3>Comisiones del agente</h3>
        <p className="muted">
          Reglas base para nuevas cotizaciones.
        </p>
      </div>

      <div className="agente-commissions-grid">
        <section className="stack agente-commission-card">
          <div>
            <h4>Comisión terrestre</h4>
            <p className="muted">Traslados, visitas, excursiones y alojamientos.</p>
          </div>

          <div className="agente-commission-fields">
            <label>
              Agente %
              <input
                min={0}
                max={99}
                step="0.01"
                type="number"
                {...form.register("comisiones.terrestre.porcentajeAgente")}
              />
            </label>

            <label>
              WTravel %
              <input
                min={0}
                max={99}
                step="0.01"
                type="number"
                {...form.register("comisiones.terrestre.porcentajeWtravel")}
              />
            </label>

            <label>
              Bancario %
              <input
                min={0}
                max={99}
                step="0.01"
                type="number"
                {...form.register("comisiones.terrestre.porcentajeBancario")}
              />
            </label>
          </div>
        </section>

        <section className="stack agente-commission-card">
          <div>
            <h4>Comisión aérea</h4>
            <p className="muted">Vuelos y trenes.</p>
          </div>

          <div className="agente-commission-fields">
            <label>
              Agente %
              <input
                min={0}
                max={99}
                step="0.01"
                type="number"
                {...form.register("comisiones.aerea.porcentajeAgente")}
              />
            </label>

            <label>
              WTravel %
              <input
                min={0}
                max={99}
                step="0.01"
                type="number"
                {...form.register("comisiones.aerea.porcentajeWtravel")}
              />
            </label>

            <label>
              Bancario %
              <input
                min={0}
                max={99}
                step="0.01"
                type="number"
                {...form.register("comisiones.aerea.porcentajeBancario")}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}