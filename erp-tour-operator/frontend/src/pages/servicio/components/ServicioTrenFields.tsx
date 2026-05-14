type Props = {
  form: any;
  ciudadesDestinoTransporteQuery: any;
};

function ordenarCiudadesPorNombre(ciudades: Array<any>) {
  return [...ciudades].sort((a, b) =>
    String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""), "es", {
      sensitivity: "base"
    })
  );
}

export function ServicioTrenFields({
  form,
  ciudadesDestinoTransporteQuery
}: Props) {
  const ciudadesDestino = ordenarCiudadesPorNombre(
    ciudadesDestinoTransporteQuery.data ?? []
  );

  return (
    <div className="grid-2">
      <label>
        Origen
        <input
          {...form.register("tren.origen")}
          disabled
          placeholder="Selecciona primero la ciudad del servicio"
        />
      </label>

      <label>
        Destino
        <select {...form.register("tren.destino")}>
          <option value="">Selecciona destino</option>
          {ciudadesDestino.map((ciudad: any) => (
            <option key={ciudad.id} value={ciudad.nombre}>
              {ciudad.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Conexiones
        <select {...form.register("tren.escalas")}>
          <option value={0}>Directo</option>
          <option value={1}>Con 1 conexión</option>
          <option value={2}>Con 2 conexiones</option>
          <option value={3}>Con 3 conexiones</option>
        </select>
      </label>

      <label>
        Clase
        <select {...form.register("tren.clase")}>
          <option value="">Selecciona clase</option>
          <option value="clase económica">Clase económica</option>
          <option value="clase turista">Clase turista</option>
          <option value="clase preferente">Clase preferente</option>
          <option value="primera clase">Primera clase</option>
        </select>
      </label>

      <label className="servicio-toggle-label">
        <input
          type="checkbox"
          {...form.register("tren.sillasReservadas")}
          className="servicio-toggle-input"
        />
        <span>Sillas reservadas</span>
      </label>
    </div>
  );
}