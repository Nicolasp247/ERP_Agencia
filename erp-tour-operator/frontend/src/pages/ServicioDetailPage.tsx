import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getServicio } from "@/modules/servicio/servicio-api";

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

  const detalle = servicio.detalleTipo ?? {};
  const esTour = servicio.tipo?.codigo === "VISITA" || servicio.tipo?.codigo === "EXCURSION";

  const modoServicio = servicio.privado ? "Privado" : "En grupo";

  function buildServicioPreview() {
    const nombre = servicio.nombreWtravel?.trim() || "Nombre del servicio";
    const tiempo = servicio.tiempoServicio?.trim();

    if (esTour) {
      const partes = [nombre];

      if (tiempo) {
        partes.push(tiempo);
      }

      partes.push(servicio.privado ? "privado" : "en grupo");

      if (detalle.tipoGuiaNombre && detalle.idiomaNombre) {
        partes.push(
          `${String(detalle.tipoGuiaNombre).toLowerCase()} en ${String(detalle.idiomaNombre).toLowerCase()}`
        );
      } else if (detalle.tipoGuiaNombre) {
        partes.push(String(detalle.tipoGuiaNombre).toLowerCase());
      } else if (detalle.idiomaNombre) {
        partes.push(`en ${String(detalle.idiomaNombre).toLowerCase()}`);
      }

      return partes.join(", ");
    }

    const partesGenericas = [nombre];

    if (tiempo) {
      partesGenericas.push(tiempo);
    }

    return partesGenericas.join(", ");
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
        <div className="grid-3">
          <div>
            <strong>Nombre interno</strong>
            <p>{servicio.nombreWtravel ?? "N/D"}</p>
          </div>

          <div>
            <strong>Tipo</strong>
            <p>{servicio.tipo?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Proveedor</strong>
            <p>{servicio.proveedor?.nombreComercial ?? "N/D"}</p>
          </div>

          <div>
            <strong>Ciudad</strong>
            <p>{servicio.ciudad?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Tiempo de servicio</strong>
            <p>{servicio.tiempoServicio ?? "N/D"}</p>
          </div>

          <div>
            <strong>Modalidad</strong>
            <p>{modoServicio}</p>
          </div>

          {esTour ? (
            <>
              <div>
                <strong>Tipo guía</strong>
                <p>{detalle.tipoGuiaNombre ?? "N/D"}</p>
              </div>

              <div>
                <strong>Idioma</strong>
                <p>{detalle.idiomaNombre ?? "N/D"}</p>
              </div>

              <div />
            </>
          ) : null}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Link de reserva</strong>
          <p>{servicio.linkReserva ?? "N/D"}</p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Descripción</strong>
          <p>{servicio.descripcion ?? "N/D"}</p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Así se verá en cotizaciones:</strong>
          <p style={{ marginTop: "0.35rem", fontWeight: 700 }}>{buildServicioPreview()}</p>
        </div>
      </PageSection>

      <PageSection title="Tarifas">
        {servicio.tarifas?.length ? (
          <table>
            <thead>
              <tr>
                <th>Año</th>
                <th>Mes</th>
                <th>Precio</th>
                <th>Moneda</th>
              </tr>
            </thead>
            <tbody>
              {servicio.tarifas.map((tarifa: any, index: number) => (
                <tr key={`${tarifa.anio}-${tarifa.mes}-${index}`}>
                  <td>{tarifa.anio ?? "N/D"}</td>
                  <td>{tarifa.mes ?? "N/D"}</td>
                  <td>{tarifa.precioUsd ?? tarifa.precio_usd ?? "N/D"}</td>
                  <td>{tarifa.monedaCodigo ?? tarifa.moneda_codigo ?? "N/D"}</td>
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