/* erp-tour-operator/frontend/src/pages/tarifa/components/TarifaBaseForm.tsx */

import { TIPOS_TARIFA, UNIDADES_PRECIO } from "@/pages/tarifa/constants/tarifa.constants";
import { formatLabel } from "@/pages/tarifa/utils/tarifa.helpers";

type TarifaBaseFormProps = {
  form: any;
  servicio: any;
  isSaving: boolean;
  onSubmit: (values: any) => void;
};

export function TarifaBaseForm({ form, servicio, isSaving, onSubmit }: TarifaBaseFormProps) {
  return (
    <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid-3">
        <label>
          Servicio
          <input value={servicio?.nombreWtravel ?? ""} disabled />
        </label>

        <label>
          Fecha desde
          <input {...form.register("fechaDesde")} type="date" />
        </label>

        <label>
          Fecha hasta
          <input {...form.register("fechaHasta")} type="date" />
        </label>
      </div>

      <div className="grid-3">
        <label>
          Tipo tarifa
          <select {...form.register("tipoTarifa")}>
            {TIPOS_TARIFA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {formatLabel(tipo)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Unidad precio
          <select {...form.register("unidadPrecio")}>
            {UNIDADES_PRECIO.map((unidad) => (
              <option key={unidad} value={unidad}>
                {formatLabel(unidad)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Precio neto
          <input {...form.register("precioNeto")} type="number" step="0.01" />
        </label>
      </div>

      <div className="grid-3">
        <label>
          Moneda
          <input {...form.register("monedaCodigo")} maxLength={3} />
        </label>

        <label>
          Fecha revisión
          <input {...form.register("fechaRevision")} type="date" />
        </label>

        <label>
          Estado
          <select {...form.register("activo")}>
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>
        </label>
      </div>

      <label>
        Observaciones
        <textarea
          {...form.register("observaciones")}
          placeholder="Ej: revisado en Civitatis, contrato proveedor, tarifa temporada alta..."
        />
      </label>

      <button className="primary-button" type="submit" disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar tarifa"}
      </button>
    </form>
  );
}