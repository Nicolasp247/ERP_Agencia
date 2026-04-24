import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getServicio } from "@/modules/servicio/servicio-api";

function lowerFirst(text: string | null | undefined) {
  if (!text) return "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function getPuntoNombre(value: any) {
  if (!value) return "N/D";
  if (typeof value === "string") return value;
  return value.nombre ?? "N/D";
}

function buildCotizacionPreview(servicio: any) {
  const tipoCodigo = servicio?.tipo?.codigo ?? "";
  const detalle = servicio?.detalleTipo ?? {};

  if (tipoCodigo === "VISITA" || tipoCodigo === "EXCURSION") {
    const partes = [
      servicio?.nombreWtravel,
      servicio?.tiempoServicio,
      servicio?.privado ? "privado" : "en grupo",
      detalle?.tipoGuiaNombre ? lowerFirst(detalle.tipoGuiaNombre) : null,
      detalle?.idiomaNombre ? `en ${lowerFirst(detalle.idiomaNombre)}` : null
    ].filter(Boolean);

    return partes.join(", ");
  }

  if (tipoCodigo === "TRASLADO") {
    const origen = getPuntoNombre(detalle?.origenNombre ?? detalle?.origen);
    const destino = getPuntoNombre(detalle?.destinoNombre ?? detalle?.destino);

    return `Traslado ${servicio?.privado ? "privado " : ""}${lowerFirst(origen)} - ${lowerFirst(destino)}`.trim();
  }

  return servicio?.nombreWtravel ?? "N/D";
}

export function ServicioDetailPage() {
  const params = useParams();

  const query = useQuery({
    queryKey: ["servicio", params.id],
    queryFn: () => getServicio(Number(params.id))
  });

  const servicio = query.data as any;

  if (!servicio) {
    return <PageSection title="Servicio">Cargando...</PageSection>;
  }

  const tipoCodigo = servicio.tipo?.codigo ?? "";
  const detalle = servicio.detalleTipo ?? {};

  const esTour = tipoCodigo === "VISITA" || tipoCodigo === "EXCURSION";
  const esTraslado = tipoCodigo === "TRASLADO";

  const preview = buildCotizacionPreview(servicio);

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

          <div className="grid-3">
            <div>
              <strong>Modalidad</strong>
              <p>{modalidad}</p>
            </div>
            <div>
              <strong>Activo</strong>
              <p>{servicio.activo ? "Sí" : "No"}</p>
            </div>
            <div />
          </div>

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
              <div />
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
              <div />
            </div>
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
        </div>
      </PageSection>

      <PageSection title="Tarifas">
        {servicio.tarifas?.length ? (
          <table>
            <thead>
              <tr>
                <th>Año</th>
                <th>Mes</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Moneda</th>
              </tr>
            </thead>
            <tbody>
              {servicio.tarifas.map((tarifa: any) => (
                <tr key={`${tarifa.anio}-${tarifa.mes}-${tarifa.tipoHabitacion}`}>
                  <td>{tarifa.anio}</td>
                  <td>{tarifa.mes}</td>
                  <td>{tarifa.tipoHabitacion}</td>
                  <td>{tarifa.precioUsd ?? "N/D"}</td>
                  <td>{tarifa.monedaCodigo ?? "N/D"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay tarifas registradas.</p>
        )}
      </PageSection>
    </div>
  );
}