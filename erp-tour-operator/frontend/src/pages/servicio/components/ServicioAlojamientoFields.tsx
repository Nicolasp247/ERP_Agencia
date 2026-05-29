/* erp-tour-operator/frontend/src/pages/servicio/components/ServicioAlojamientoFields.tsx */

type ServicioAlojamientoFieldsProps = {
  form: any;
};

export function ServicioAlojamientoFields({ form }: ServicioAlojamientoFieldsProps) {
  const regimen = form.watch("alojamiento.regimen");

  return (
    <div className="servicio-card-soft">
      <div className="stack">
        <div>
          <strong>Detalle del alojamiento base</strong>
          <p className="servicio-card-soft-help">
            Este bloque describe el producto general de alojamiento. Las categorías
            hoteleras como Turista, Primera o Lujo y sus precios se cargan después en
            la matriz de precios de alojamiento.
          </p>
        </div>

        <div className="grid-2">
          <label>
            Régimen
            <select {...form.register("alojamiento.regimen")}>
              <option value="">Selecciona</option>
              <option value="SOLO_ALOJAMIENTO">Solo alojamiento</option>
              <option value="ALOJAMIENTO_DESAYUNO">Alojamiento y desayuno</option>
              <option value="TODO_INCLUIDO">Todo incluido</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          {regimen === "OTRO" ? (
            <label>
              Régimen personalizado
              <input
                {...form.register("alojamiento.regimenOtro")}
                placeholder="Ej: media pensión"
              />
            </label>
          ) : null}

          <label className="servicio-toggle-label">
            <input
              className="servicio-toggle-input"
              type="checkbox"
              {...form.register("alojamiento.desayuno")}
            />
            Incluye desayuno
          </label>
        </div>

        <p className="servicio-card-soft-help">
          El proveedor del hotel será el mismo proveedor seleccionado arriba. Ejemplo:
          si creas “Alojamiento en Bogotá”, no crees otro servicio para Turista o Lujo.
          Esas opciones se guardan como precios en la matriz de alojamiento.
        </p>
      </div>
    </div>
  );
}