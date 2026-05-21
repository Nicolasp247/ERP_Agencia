/* erp-tour-operator/frontend/src/pages/ServicioDetailPage.tsx */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getServicio, updateServicioEstado } from "@/modules/servicio/servicio-api";
import { buildServicioCotizacionPreview } from "@/modules/servicio/servicio-preview";
import { deleteTarifa, saveTarifa } from "@/modules/tarifa/tarifa-api";
import { formatDateRangeShortEs, formatDateShortEs } from "@/utils/date-format";

function getPuntoNombre(value: any) {
  if (!value) return "N/D";
  if (typeof value === "string") return value;
  return value.nombre ?? "N/D";
}

function formatLabel(value?: string | null) {
  return String(value ?? "N/D")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

const TIPOS_TARIFA = [
  "GENERAL",
  "ADULTO",
  "NIÑO",
  "SGL",
  "DBL",
  "TPL",
  "VEHICULO",
  "GRUPO"
];

const UNIDADES_PRECIO = [
  "POR_PERSONA",
  "POR_SERVICIO",
  "POR_NOCHE",
  "POR_HABITACION",
  "POR_VEHICULO",
  "POR_GRUPO"
];

export function ServicioDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const servicioId = Number(params.id);
  const [tarifaEditando, setTarifaEditando] = useState<any | null>(null);

  const query = useQuery({
    queryKey: ["servicio", params.id],
    queryFn: () => getServicio(servicioId),
    enabled: Number.isFinite(servicioId)
  });

  const estadoMutation = useMutation({
    mutationFn: (activo: boolean) => updateServicioEstado(servicioId, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicio", params.id] });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    }
  });

  const editarTarifaMutation = useMutation({
    mutationFn: (values: any) => saveTarifa(values, values.id),
    onSuccess: () => {
      setTarifaEditando(null);
      queryClient.invalidateQueries({ queryKey: ["servicio", params.id] });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
      queryClient.invalidateQueries({ queryKey: ["tarifas"] });
    }
  });

  const eliminarTarifaMutation = useMutation({
    mutationFn: (id: number) => deleteTarifa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicio", params.id] });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
      queryClient.invalidateQueries({ queryKey: ["tarifas"] });
    }
  });

  const servicio = query.data as any;

  if (!servicio) {
    return <PageSection title="Servicio">Cargando...</PageSection>;
  }

  const tipoCodigo = servicio.tipo?.codigo ?? "";
  const detalle = servicio.detalleTipo ?? {};

  const esEntrada = tipoCodigo === "ENTRADA";
  const esTour = tipoCodigo === "VISITA" || tipoCodigo === "EXCURSION";
  const esTraslado = tipoCodigo === "TRASLADO";
  const esVuelo = tipoCodigo === "VUELO";
  const esTren = tipoCodigo === "TREN";
  const esOtro = tipoCodigo === "OTRO";

  const continente =
    servicio?.ciudad?.pais?.continente?.nombre ??
    servicio?.continente?.nombre ??
    "N/D";

  const pais =
    servicio?.pais?.nombre ??
    servicio?.ciudad?.pais?.nombre ??
    "N/D";

  const modalidad = servicio?.privado ? "Privado" : "En grupo";

  const origenNombre = getPuntoNombre(detalle?.origenNombre ?? detalle?.origen);
  const destinoNombre = getPuntoNombre(detalle?.destinoNombre ?? detalle?.destino);

  const preview = buildServicioCotizacionPreview({
    tipoCodigo,
    nombreWtravel: servicio.nombreWtravel,
    tiempoServicio: servicio.tiempoServicio,
    privado: servicio.privado,
    tipoGuiaNombre: detalle?.tipoGuiaNombre,
    idiomaNombre: detalle?.idiomaNombre,
    origenNombre,
    destinoNombre,
    vueloOrigen: detalle?.origen,
    vueloDestino: detalle?.destino,
    vueloEscalas: detalle?.escalas,
    vueloClase: detalle?.clase,
    vueloEquipaje: detalle?.equipaje,
    trenOrigen: detalle?.origen,
    trenDestino: detalle?.destino,
    trenEscalas: detalle?.escalas,
    trenClase: detalle?.clase,
    trenSillasReservadas: detalle?.sillasReservadas
  });

  function iniciarEdicionTarifa(tarifa: any) {
    setTarifaEditando({
      id: tarifa.id,
      idServicio: tarifa.idServicio ?? servicio.id,
      fechaDesde: tarifa.fechaDesde ?? "",
      fechaHasta: tarifa.fechaHasta ?? "",
      tipoTarifa: tarifa.tipoTarifa ?? "GENERAL",
      unidadPrecio: tarifa.unidadPrecio ?? "POR_PERSONA",
      precioNeto: tarifa.precioNeto ?? "",
      monedaCodigo: tarifa.monedaCodigo ?? "USD",
      activo: Boolean(tarifa.activo),
      observaciones: tarifa.observaciones ?? "",
      fechaRevision: tarifa.fechaRevision ?? ""
    });
  }

  function actualizarTarifaEditando(key: string, value: unknown) {
    setTarifaEditando((current: any) => ({
      ...current,
      [key]: value
    }));
  }

  function eliminarTarifa(id: number) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta tarifa? Esta acción no eliminará el servicio."
    );

    if (confirmar) {
      eliminarTarifaMutation.mutate(id);
    }
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/servicios/${servicio.id}/edit`}>
              Editar
            </Link>
            <Link className="link-button" to="/servicios">
              Volver
            </Link>
          </div>
        }
        title={servicio.nombreWtravel}
      >
        <div className="stack">
          <div className="grid-3">
            <div>
              <strong>Nombre interno</strong>
              <p>{servicio.nombreWtravel}</p>
            </div>

            <div>
              <strong>Tipo</strong>
              <p>{servicio.tipo?.nombre ?? "N/D"}</p>
            </div>

            <div>
              <strong>Proveedor</strong>
              <p>{servicio.proveedor?.nombreComercial ?? "N/D"}</p>
            </div>
          </div>

          <div className="grid-3">
            <div>
              <strong>Continente</strong>
              <p>{continente}</p>
            </div>

            <div>
              <strong>País</strong>
              <p>{pais}</p>
            </div>

            <div>
              <strong>Ciudad</strong>
              <p>{servicio.ciudad?.nombre ?? "N/D"}</p>
            </div>
          </div>

          {esEntrada ? (
            <div className="grid-3">
              <div>
                <strong>Tipo guía</strong>
                <p>{detalle?.tipoGuiaNombre ?? "N/D"}</p>
              </div>

              <div>
                <strong>Idioma</strong>
                <p>{detalle?.idiomaNombre ?? "N/D"}</p>
              </div>

              <div>
                <strong>Activo</strong>
                <p>{servicio.activo ? "Sí" : "No"}</p>
              </div>
            </div>
          ) : esVuelo || esTren || esOtro ? (
            <div className="grid-3">
              <div>
                <strong>Activo</strong>
                <p>{servicio.activo ? "Sí" : "No"}</p>
              </div>
            </div>
          ) : (
            <div className="grid-3">
              <div>
                <strong>Modalidad</strong>
                <p>{modalidad}</p>
              </div>

              <div>
                <strong>Activo</strong>
                <p>{servicio.activo ? "Sí" : "No"}</p>
              </div>
            </div>
          )}

          {esTour && (
            <div className="grid-3">
              <div>
                <strong>Tipo guía</strong>
                <p>{detalle?.tipoGuiaNombre ?? "N/D"}</p>
              </div>

              <div>
                <strong>Idioma</strong>
                <p>{detalle?.idiomaNombre ?? "N/D"}</p>
              </div>
            </div>
          )}

          {esTraslado && (
            <div className="grid-3">
              <div>
                <strong>Origen</strong>
                <p>{origenNombre}</p>
              </div>

              <div>
                <strong>Destino</strong>
                <p>{destinoNombre}</p>
              </div>
            </div>
          )}

          {esVuelo && (
            <>
              <div className="grid-3">
                <div>
                  <strong>Origen</strong>
                  <p>{detalle?.origen ?? "N/D"}</p>
                </div>

                <div>
                  <strong>Destino</strong>
                  <p>{detalle?.destino ?? "N/D"}</p>
                </div>

                <div>
                  <strong>Escalas</strong>
                  <p>
                    {Number(detalle?.escalas ?? 0) === 0
                      ? "Directo"
                      : Number(detalle?.escalas) === 1
                      ? "1 escala"
                      : `${detalle?.escalas} escalas`}
                  </p>
                </div>
              </div>

              <div className="grid-3">
                <div>
                  <strong>Clase</strong>
                  <p>{detalle?.clase ?? "N/D"}</p>
                </div>

                <div>
                  <strong>Equipaje</strong>
                  <p>{detalle?.equipaje ?? "N/D"}</p>
                </div>
              </div>
            </>
          )}

          {esTren && (
            <>
              <div className="grid-3">
                <div>
                  <strong>Origen</strong>
                  <p>{detalle?.origen ?? "N/D"}</p>
                </div>

                <div>
                  <strong>Destino</strong>
                  <p>{detalle?.destino ?? "N/D"}</p>
                </div>

                <div>
                  <strong>Conexiones</strong>
                  <p>
                    {Number(detalle?.escalas ?? 0) === 0
                      ? "Directo"
                      : Number(detalle?.escalas) === 1
                      ? "1 conexión"
                      : `${detalle?.escalas} conexiones`}
                  </p>
                </div>
              </div>

              <div className="grid-3">
                <div>
                  <strong>Clase</strong>
                  <p>{detalle?.clase ?? "N/D"}</p>
                </div>

                <div>
                  <strong>Sillas reservadas</strong>
                  <p>{detalle?.sillasReservadas ? "Sí" : "No"}</p>
                </div>
              </div>
            </>
          )}

          <div>
            <strong>Link de reserva</strong>
            <p>{servicio.linkReserva ?? "N/D"}</p>
          </div>

          <div>
            <strong>Descripción</strong>
            <p>{servicio.descripcion ?? "N/D"}</p>
          </div>

          <div>
            <strong>Así se verá en cotizaciones:</strong>
            <p>
              <strong>{preview}</strong>
            </p>
          </div>

          <div className="service-status-card">
            <div>
              <strong>Estado del servicio</strong>
              <p className="muted">
                Activa o desactiva este servicio sin borrar su información ni sus tarifas.
              </p>
            </div>

            <label className="service-status-toggle">
              <input
                type="checkbox"
                checked={Boolean(servicio.activo)}
                disabled={estadoMutation.isPending}
                onChange={(event) => estadoMutation.mutate(event.target.checked)}
              />
              <span>{servicio.activo ? "Servicio activo" : "Servicio inactivo"}</span>
            </label>
          </div>
        </div>
      </PageSection>

      <PageSection title="Tarifas">
        {servicio.tarifas?.length ? (
          <table>
            <thead>
              <tr>
                <th>Vigencia</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Precio neto</th>
                <th>Revisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {servicio.tarifas.map((tarifa: any) => (
                <tr key={tarifa.id}>
                  <td>{formatDateRangeShortEs(tarifa.fechaDesde, tarifa.fechaHasta)}</td>
                  <td>{formatLabel(tarifa.tipoTarifa)}</td>
                  <td>{formatLabel(tarifa.unidadPrecio)}</td>
                  <td>
                    {tarifa.precioNeto ?? "N/D"} {tarifa.monedaCodigo ?? ""}
                  </td>
                  <td>{formatDateShortEs(tarifa.fechaRevision)}</td>
                  <td>
                    <span
                      className={
                        tarifa.activo
                          ? "status-chip status-chip-active"
                          : "status-chip status-chip-inactive"
                      }
                    >
                      {tarifa.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>
                    <div className="toolbar">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => iniciarEdicionTarifa(tarifa)}
                      >
                        Editar
                      </button>

                      <button
                        className="danger-button"
                        type="button"
                        disabled={eliminarTarifaMutation.isPending}
                        onClick={() => eliminarTarifa(tarifa.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay tarifas registradas.</p>
        )}
        {tarifaEditando ? (
          <form
            className="tarifa-edit-card"
            onSubmit={(event) => {
              event.preventDefault();
              editarTarifaMutation.mutate(tarifaEditando);
            }}
          >
            <div>
              <strong>Editar tarifa</strong>
              <p className="muted">
                Modifica la vigencia, tipo, unidad o precio neto de esta tarifa.
              </p>
            </div>

            <div className="grid-3">
              <label>
                Fecha desde
                <input
                  type="date"
                  value={tarifaEditando.fechaDesde}
                  onChange={(event) => actualizarTarifaEditando("fechaDesde", event.target.value)}
                />
              </label>

              <label>
                Fecha hasta
                <input
                  type="date"
                  value={tarifaEditando.fechaHasta}
                  onChange={(event) => actualizarTarifaEditando("fechaHasta", event.target.value)}
                />
              </label>

              <label>
                Precio neto
                <input
                  type="number"
                  step="0.01"
                  value={tarifaEditando.precioNeto}
                  onChange={(event) => actualizarTarifaEditando("precioNeto", event.target.value)}
                />
              </label>
            </div>

            <div className="grid-3">
              <label>
                Tipo tarifa
                <select
                  value={tarifaEditando.tipoTarifa}
                  onChange={(event) => actualizarTarifaEditando("tipoTarifa", event.target.value)}
                >
                  {TIPOS_TARIFA.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {formatLabel(tipo)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Unidad precio
                <select
                  value={tarifaEditando.unidadPrecio}
                  onChange={(event) => actualizarTarifaEditando("unidadPrecio", event.target.value)}
                >
                  {UNIDADES_PRECIO.map((unidad) => (
                    <option key={unidad} value={unidad}>
                      {formatLabel(unidad)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Moneda
                <input
                  maxLength={3}
                  value={tarifaEditando.monedaCodigo}
                  onChange={(event) =>
                    actualizarTarifaEditando("monedaCodigo", event.target.value.toUpperCase())
                  }
                />
              </label>
            </div>

            <div className="grid-3">
              <label>
                Fecha revisión
                <input
                  type="date"
                  value={tarifaEditando.fechaRevision ?? ""}
                  onChange={(event) => actualizarTarifaEditando("fechaRevision", event.target.value)}
                />
              </label>

              <label>
                Estado
                <select
                  value={tarifaEditando.activo ? "true" : "false"}
                  onChange={(event) =>
                    actualizarTarifaEditando("activo", event.target.value === "true")
                  }
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </label>
            </div>

            <label>
              Observaciones
              <textarea
                value={tarifaEditando.observaciones ?? ""}
                onChange={(event) => actualizarTarifaEditando("observaciones", event.target.value)}
              />
            </label>

            <div className="toolbar">
              <button className="primary-button" type="submit" disabled={editarTarifaMutation.isPending}>
                {editarTarifaMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </button>

              <button
                className="link-button"
                type="button"
                onClick={() => setTarifaEditando(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}
      </PageSection>
    </div>
  );
}