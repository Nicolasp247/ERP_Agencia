import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { ServicioPreview } from "@/pages/servicio/components/ServicioPreview";
import { ServicioTourFields } from "@/pages/servicio/components/ServicioTourFields";
import { ServicioTrasladoFields } from "@/pages/servicio/components/ServicioTrasladoFields";
import "@/pages/servicio/styles/servicio-form.css";

type Props = {
  form: any;
  editingId?: number;
  tiposQuery: any;
  proveedoresQuery: any;
  continentesQuery: any;
  paisesQuery: any;
  ciudadesQuery: any;
  idiomasQuery: any;
  tiposGuiaQuery: any;
  puntosTrasladoQuery: any;
  tipoActual: any;
  privado: boolean;
  idContinente: number | null | undefined;
  idPais: number | null | undefined;
  idCiudad: number | null | undefined;
  trasladoIdOrigen: number | null | undefined;
  trasladoIdDestino: number | null | undefined;
  preview: string;
  errorMessage?: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
};

export function ServicioFormView({
  form,
  editingId,
  tiposQuery,
  proveedoresQuery,
  continentesQuery,
  paisesQuery,
  ciudadesQuery,
  idiomasQuery,
  tiposGuiaQuery,
  puntosTrasladoQuery,
  tipoActual,
  privado,
  idContinente,
  idPais,
  idCiudad,
  trasladoIdOrigen,
  trasladoIdDestino,
  preview,
  errorMessage,
  onSubmit
}: Props) {
  return (
    <PageSection
      action={
        <Link className="link-button" to="/servicios">
          Volver
        </Link>
      }
      title={editingId ? "Editar servicio" : "Nuevo servicio"}
    >
      <form className="stack" onSubmit={onSubmit}>
        <div className="grid-2">
          <label>
            Tipo
            <select {...form.register("idTipo")}>
              <option value="">Selecciona</option>
              {(tiposQuery.data ?? []).map((tipo: any) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Proveedor
            <select {...form.register("idProveedor")}>
              <option value="">Selecciona</option>
              {((proveedoresQuery.data ?? []) as Array<any>).map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombreComercial}
                </option>
              ))}
            </select>
          </label>

          <label>
            Continente
            <select {...form.register("idContinente")}>
              <option value="">Selecciona</option>
              {(continentesQuery.data ?? []).map((continente: any) => (
                <option key={continente.id} value={continente.id}>
                  {continente.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            País
            <select {...form.register("idPais")} disabled={!idContinente}>
              <option value="">Selecciona</option>
              {(paisesQuery.data ?? []).map((pais: any) => (
                <option key={pais.id} value={pais.id}>
                  {pais.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ciudad
            <select {...form.register("idCiudad")} disabled={!idPais}>
              <option value="">Selecciona</option>
              {(ciudadesQuery.data ?? []).map((ciudad: any) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nombre interno
            <input {...form.register("nombreWtravel")} />
          </label>

          {tipoActual?.codigo !== "TRASLADO" && tipoActual?.codigo !== "ENTRADA" ? (
            <label>
              Tiempo de servicio
              <input {...form.register("tiempoServicio")} />
            </label>
          ) : (
            <div />
          )}

          <label>
            Link de reserva
            <input {...form.register("linkReserva")} />
          </label>
        </div>

        {(tipoActual?.codigo === "VISITA" ||
          tipoActual?.codigo === "EXCURSION" ||
          tipoActual?.codigo === "ENTRADA") && (
          <ServicioTourFields
            form={form}
            tiposGuiaQuery={tiposGuiaQuery}
            idiomasQuery={idiomasQuery}
            privado={privado}
            mostrarPrivado={tipoActual?.codigo !== "ENTRADA"}
          />
        )}

        {tipoActual?.codigo === "TRASLADO" && (
          <ServicioTrasladoFields
            form={form}
            privado={privado}
            idCiudad={idCiudad}
            puntosTrasladoQuery={puntosTrasladoQuery}
            trasladoIdOrigen={trasladoIdOrigen}
            trasladoIdDestino={trasladoIdDestino}
          />
        )}

        <label>
          Descripción
          <textarea {...form.register("descripcion")} rows={3} />
        </label>

        <ServicioPreview preview={preview} />

        {errorMessage ? (
          <div className="servicio-form-alert" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {tipoActual?.codigo === "ALOJAMIENTO" ? (
          <div className="grid-2">
            <label>
              Noches
              <input {...form.register("alojamiento.noches")} type="number" />
            </label>
            <label>
              Habitaciones
              <input {...form.register("alojamiento.habitaciones")} type="number" />
            </label>
          </div>
        ) : null}

        <button className="primary-button" type="submit">
          Guardar
        </button>
      </form>
    </PageSection>
  );
}