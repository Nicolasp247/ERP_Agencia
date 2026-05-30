/* erp-tour-operator/frontend/src/pages/tarifa/components/AlojamientoPrecioForm.tsx */

import {
  CATEGORIAS_HABITACION,
  CATEGORIAS_HOTEL,
  REGIMENES_ALOJAMIENTO,
  TIPOS_HABITACION
} from "@/modules/alojamiento-precio/alojamiento-precio-api";

type AlojamientoPrecioFormProps = {
  form: any;
  servicio: any;
  isSaving: boolean;
  isEditing: boolean;
  onSubmit: (values: any) => void;
  onCancelEdit: () => void;
};

export function AlojamientoPrecioForm({
  form,
  servicio,
  isSaving,
  isEditing,
  onSubmit,
  onCancelEdit
}: AlojamientoPrecioFormProps) {
  return (
    <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="servicio-card-soft">
        <strong>{servicio?.nombreWtravel}</strong>
        <p className="servicio-card-soft-help">
          Este alojamiento usa precios por ciudad, categoría hotelera, habitación,
          régimen, rango de fechas y tipo de habitación.
        </p>
      </div>

      <div className="grid-3">
        <label>
          Fecha desde
          <input {...form.register("fechaDesde")} type="date" />
        </label>

        <label>
          Fecha hasta
          <input {...form.register("fechaHasta")} type="date" />
        </label>

        <label>
          Categoría hotelera
          <select {...form.register("categoria")}>
            {CATEGORIAS_HOTEL.map((categoria) => (
              <option key={categoria.value} value={categoria.value}>
                {categoria.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-3">
        <label>
          Categoría habitación
          <select {...form.register("categoriaHab")}>
            {CATEGORIAS_HABITACION.map((categoria) => (
              <option key={categoria.value} value={categoria.value}>
                {categoria.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Régimen
          <select {...form.register("regimen")}>
            {REGIMENES_ALOJAMIENTO.map((regimen) => (
              <option key={regimen.value} value={regimen.value}>
                {regimen.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo habitación
          <select {...form.register("tipoHabitacion")}>
            {TIPOS_HABITACION.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-3">
        <label>
          Precio USD
          <input {...form.register("precioUsd")} type="number" step="0.01" />
        </label>

        <label>
          Estado
          <select {...form.register("activo")}>
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>
        </label>
      </div>

      <div className="toolbar">
        <button className="primary-button" type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar precio"}
        </button>

        {isEditing ? (
          <button className="link-button" type="button" onClick={onCancelEdit}>
            Cancelar edición
          </button>
        ) : null}
      </div>
    </form>
  );
}