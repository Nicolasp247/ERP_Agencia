type Props = {
  form: any;
  tiposGuiaQuery: any;
  idiomasQuery: any;
  privado: boolean;
  mostrarPrivado?: boolean;
};

export function ServicioTourFields({
  form,
  tiposGuiaQuery,
  idiomasQuery,
  privado,
  mostrarPrivado = true
}: Props) {
  return (
    <>
      <div className="grid-2">
        <label>
          Tipo guía
          <select {...form.register("tour.idTipoGuia")}>
            <option value="">Selecciona</option>
            {(tiposGuiaQuery.data ?? []).map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Idioma
          <select {...form.register("tour.idIdioma")}>
            <option value="">Selecciona</option>
            {(idiomasQuery.data ?? []).map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mostrarPrivado ? (
        <div className="servicio-card-soft">
          <div className="servicio-card-soft-grid">
            <div>
              <strong>Servicio privado</strong>
              <p className="servicio-card-soft-help">
                Márcalo si esta visita o excursión se cotiza de forma exclusiva. Si no está marcado,
                se mostrará como servicio en grupo.
              </p>
            </div>

            <label className="servicio-toggle-label">
              <input type="checkbox" {...form.register("privado")} className="servicio-toggle-input" />
              <span>{privado ? "Privado" : "En grupo"}</span>
            </label>
          </div>
        </div>
      ) : null}
    </>
  );
}