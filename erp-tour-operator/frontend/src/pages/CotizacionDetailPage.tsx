/* erp-tour-operator/frontend/src/pages/CotizacionDetailPage.tsx */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { discardCotizacion, getCotizacion } from "@/modules/cotizacion/cotizacion-api";
import { formatDateShortEs } from "@/utils/date-format";

export function CotizacionDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const query = useQuery({
    queryKey: ["cotizacion", id],
    queryFn: () => getCotizacion(id)
  });

  const discardMutation = useMutation({
    mutationFn: () => discardCotizacion(id),
    onSuccess: () => void query.refetch()
  });

  const expediente = query.data as any;

  if (!expediente) {
    return <PageSection title="Cotización">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/cotizaciones/${id}/edit`}>
              Editar datos
            </Link>

            <button className="link-button" onClick={() => discardMutation.mutate()} type="button">
              Descartar expediente
            </button>

            <Link className="link-button" to="/cotizaciones">
              Volver
            </Link>
          </div>
        }
        title={`${expediente.codigo}`}
      >
        <div className="grid-3">
          <div>
            <strong>Cliente</strong>
            <p>{expediente.cliente?.nombreCompleto ?? "N/D"}</p>
          </div>

          <div>
            <strong>Agencia</strong>
            <p>{expediente.clienteAgente?.razonSocial ?? "Directo"}</p>
          </div>

          <div>
            <strong>Estado</strong>
            <p>{expediente.estado}</p>
          </div>

          <div>
            <strong>Fecha principal</strong>
            <p>{formatDateShortEs(expediente.fechaViajePrincipal)}</p>
          </div>

          <div>
            <strong>Destino principal</strong>
            <p>{expediente.destinoPrincipal?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Moneda</strong>
            <p>{expediente.monedaCodigo}</p>
          </div>
        </div>

        <div className="grid-3">
          <div>
            <strong>Adultos 65+</strong>
            <p>{expediente.adultos65}</p>
          </div>

          <div>
            <strong>Adultos 19-64</strong>
            <p>{expediente.adultos1964}</p>
          </div>

          <div>
            <strong>Jóvenes 12-18</strong>
            <p>{expediente.jovenes1218}</p>
          </div>

          <div>
            <strong>Niños 3-11</strong>
            <p>{expediente.ninos311}</p>
          </div>

          <div>
            <strong>Infantes 0-2</strong>
            <p>{expediente.infantes02}</p>
          </div>

          <div>
            <strong>Total pasajeros</strong>
            <p>{expediente.totalPasajeros}</p>
          </div>
        </div>

        <div className="grid-2">
          <div>
            <strong>Observaciones del pasajero</strong>
            <p>{expediente.observacionesCliente ?? "N/D"}</p>
          </div>

          <div>
            <strong>Notas internas</strong>
            <p>{expediente.notasInternas ?? "N/D"}</p>
          </div>
        </div>
      </PageSection>

      <PageSection
        action={
          <button className="primary-button" type="button">
            Crear nuevo itinerario
          </button>
        }
        title="Versiones de cotización"
      >
        {expediente.cotizaciones?.length ? (
          <table>
            <thead>
              <tr>
                <th>Versión</th>
                <th>Estado</th>
                <th>Fecha creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {expediente.cotizaciones.map((version: any) => (
                <tr key={version.id}>
                  <td>
                    <strong>{version.versionLabel}</strong>
                    <p className="table-subtext">{version.nombreCotizacion}</p>
                  </td>

                  <td>
                    <span className="status-chip status-chip-neutral">{version.estadoVersion}</span>
                  </td>

                  <td>{formatDateShortEs(version.createdAt)}</td>

                  <td>
                    <div className="toolbar">
                      <button className="link-button" type="button">
                        Construir
                      </button>
                      <button className="link-button" type="button">
                        Duplicar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Este expediente todavía no tiene versiones de cotización.</p>
        )}
      </PageSection>
    </div>
  );
}