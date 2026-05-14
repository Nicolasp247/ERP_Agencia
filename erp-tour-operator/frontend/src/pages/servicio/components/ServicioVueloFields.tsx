type Props = {
  form: any;
  ciudadesDestinoVueloQuery: any;
};

function ordenarCiudadesPorNombre(ciudades: Array<any>) {
  return [...ciudades].sort((a, b) =>
    String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""), "es", {
      sensitivity: "base"
    })
  );
}

export function ServicioVueloFields({
  form,
  ciudadesDestinoVueloQuery
}: Props) {
  const ciudadesDestino = ordenarCiudadesPorNombre(ciudadesDestinoVueloQuery.data ?? []);

  return (
    <div className="grid-2">
      <label>
        Origen
        <input
          {...form.register("vuelo.origen")}
          disabled
          placeholder="Selecciona primero la ciudad del servicio"
        />
      </label>

      <label>
        Destino
        <select {...form.register("vuelo.destino")}>
          <option value="">Selecciona destino</option>
          {ciudadesDestino.map((ciudad: any) => (
            <option key={ciudad.id} value={ciudad.nombre}>
              {ciudad.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Escalas
        <select {...form.register("vuelo.escalas")}>
          <option value={0}>Directo</option>
          <option value={1}>Con 1 escala</option>
          <option value={2}>Con 2 escalas</option>
          <option value={3}>Con 3 escalas</option>
        </select>
      </label>

      <label>
        Clase
        <select {...form.register("vuelo.clase")}>
          <option value="">Selecciona clase</option>
          <option value="clase económica">Clase económica</option>
          <option value="clase premium economy">Clase premium economy</option>
          <option value="clase ejecutiva">Clase ejecutiva</option>
          <option value="primera clase">Primera clase</option>
        </select>
      </label>

      <label>
        Equipaje
        <select {...form.register("vuelo.equipaje")}>
          <option value="">Selecciona equipaje</option>
          <option value="sin equipaje de bodega">Sin equipaje de bodega</option>
          <option value="equipaje de mano incluido">Equipaje de mano incluido</option>
          <option value="equipaje de bodega incluido">Equipaje de bodega incluido</option>
          <option value="equipaje de bodega 10kg+6kg">Equipaje de bodega 10kg+6kg</option>
          <option value="equipaje de bodega 23kg">Equipaje de bodega 23kg</option>
          <option value="equipaje de bodega 23kg + equipaje de mano">Equipaje de bodega 23kg + equipaje de mano</option>
        </select>
      </label>
    </div>
  );
}