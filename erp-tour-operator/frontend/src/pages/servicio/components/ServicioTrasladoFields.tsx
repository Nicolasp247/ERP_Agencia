import { NUEVO_PUNTO_OPTION } from "@/modules/servicio/servicio-api";

type PuntoTrasladoItem = {
  id: number;
  nombre: string;
};

type Props = {
  form: any;
  privado: boolean;
  idCiudad: number | null | undefined;
  puntosTrasladoQuery: any;
  trasladoIdOrigen: number | null | undefined;
  trasladoIdDestino: number | null | undefined;
};

export function ServicioTrasladoFields({
  form,
  privado,
  idCiudad,
  puntosTrasladoQuery,
  trasladoIdOrigen,
  trasladoIdDestino
}: Props) {
  const nuevoOrigen = form.watch("traslado.nuevoOrigen");
  const nuevoDestino = form.watch("traslado.nuevoDestino");

  const valorSelectOrigen =
    nuevoOrigen !== null && nuevoOrigen !== undefined
      ? NUEVO_PUNTO_OPTION
      : trasladoIdOrigen
      ? String(trasladoIdOrigen)
      : "";

  const valorSelectDestino =
    nuevoDestino !== null && nuevoDestino !== undefined
      ? NUEVO_PUNTO_OPTION
      : trasladoIdDestino
      ? String(trasladoIdDestino)
      : "";

  const mostrarNuevoOrigen = valorSelectOrigen === NUEVO_PUNTO_OPTION;
  const mostrarNuevoDestino = valorSelectDestino === NUEVO_PUNTO_OPTION;

  return (
    <>
      <div className="servicio-card-soft">
        <div className="servicio-card-soft-grid">
          <div>
            <strong>Traslado privado</strong>
            <p className="servicio-card-soft-help">
              Márcalo si el traslado es exclusivo. Si no está marcado, el formato quedará sin la
              palabra privado.
            </p>
          </div>

          <label className="servicio-toggle-label">
            <input type="checkbox" {...form.register("privado")} className="servicio-toggle-input" />
            <span>{privado ? "Privado" : "Normal"}</span>
          </label>
        </div>
      </div>

      <div className="grid-2">
        <label>
          Origen
          <select
            value={valorSelectOrigen}
            disabled={!idCiudad}
            onChange={(e) => {
              const value = e.target.value;

              if (value === NUEVO_PUNTO_OPTION) {
                form.setValue("traslado.idOrigen", null);
                form.setValue("traslado.nuevoOrigen", "");
                return;
              }

              if (!value) {
                form.setValue("traslado.idOrigen", null);
                form.setValue("traslado.nuevoOrigen", null);
                return;
              }

              form.setValue("traslado.idOrigen", Number(value));
              form.setValue("traslado.nuevoOrigen", null);
            }}
          >
            <option value="">Selecciona</option>
            {(puntosTrasladoQuery.data ?? []).map((item: PuntoTrasladoItem) => (
              <option key={item.id} value={item.id} disabled={Number(trasladoIdDestino) === item.id}>
                {item.nombre}
              </option>
            ))}
            <option value={NUEVO_PUNTO_OPTION}>+ Crear nuevo punto</option>
          </select>

          {mostrarNuevoOrigen && (
            <input
              {...form.register("traslado.nuevoOrigen")}
              placeholder="Escribe el nuevo punto de origen"
            />
          )}
        </label>

        <label>
          Destino
          <select
            value={valorSelectDestino}
            disabled={!idCiudad}
            onChange={(e) => {
              const value = e.target.value;

              if (value === NUEVO_PUNTO_OPTION) {
                form.setValue("traslado.idDestino", null);
                form.setValue("traslado.nuevoDestino", "");
                return;
              }

              if (!value) {
                form.setValue("traslado.idDestino", null);
                form.setValue("traslado.nuevoDestino", null);
                return;
              }

              form.setValue("traslado.idDestino", Number(value));
              form.setValue("traslado.nuevoDestino", null);
            }}
          >
            <option value="">Selecciona</option>
            {(puntosTrasladoQuery.data ?? []).map((item: PuntoTrasladoItem) => (
              <option key={item.id} value={item.id} disabled={Number(trasladoIdOrigen) === item.id}>
                {item.nombre}
              </option>
            ))}
            <option value={NUEVO_PUNTO_OPTION}>+ Crear nuevo punto</option>
          </select>

          {mostrarNuevoDestino && (
            <input
              {...form.register("traslado.nuevoDestino")}
              placeholder="Escribe el nuevo punto de destino"
            />
          )}
        </label>
      </div>
    </>
  );
}