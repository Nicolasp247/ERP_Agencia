/* erp-tour-operator/frontend/src/pages/CotizacionDetailPage.tsx */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import {
  getExpedienteEstadoClass,
  getVersionEstadoClass,
  formatExpedienteEstado,
  formatVersionEstado
} from "@/modules/cotizacion/cotizacion-labels";
import { discardCotizacion, getCotizacion } from "@/modules/cotizacion/cotizacion-api";
import { formatDateShortEs } from "@/utils/date-format";

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "N/D";
  }

  return String(value);
}

export function CotizacionDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const query = useQuery({
    queryKey: ["cotizacion", id],
    queryFn: () => getCotizacion(id),
    enabled: Number.isFinite(id)
  });

  const discardMutation = useMutation({
    mutationFn: () => discardCotizacion(id),
    onSuccess: () => void query.refetch()
  });

  const expediente = query.data as any;

  if (!expediente) {
    return <PageSection title="Cotización">Cargando...</PageSection>;
  }

  const totalAdultos =
    Number(expediente.adultos65 ?? 0) + Number(expediente.adultos1964 ?? 0);

  const totalMenores =
    Number(expediente.jovenes1218 ?? 0) +
    Number(expediente.ninos311 ?? 0) +
    Number(expediente.infantes02 ?? 0);

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/cotizaciones/${id}/edit`}>
              Editar datos
            </Link>

            <button
              className="link-button"
              disabled={discardMutation.isPending}
              onClick={() => discardMutation.mutate()}
              type="button"
            >
              {discardMutation.isPending ? "Descartando..." : "Descartar expediente"}
            </button>

            <Link className="link-button" to="/cotizaciones">
              Volver
            </Link>
          </div>
        }
        title={expediente.codigo}
      >
        <div className="expediente-hero">
          <div>
            <p className="eyebrow">Carpeta comercial</p>
            <h3>{expediente.nombreExpediente}</h3>
            <p className="muted">
              Cliente: {formatValue(expediente.cliente?.nombreCompleto)} · Agencia:{" "}
              {expediente.clienteAgente?.razonSocial ?? "WT / Directo"}
            </p>
          </div>

          <span className={`status-chip ${getExpedienteEstadoClass(expediente.estado)}`}>
            {formatExpedienteEstado(expediente.estado)}
          </span>
        </div>

        <div className="expediente-summary-grid">
          <div className="metric-card">
            <span>Fecha principal</span>
            <strong>{formatDateShortEs(expediente.fechaViajePrincipal)}</strong>
          </div>

          <div className="metric-card">
            <span>Destino principal</span>
            <strong>{expediente.destinoPrincipal?.nombre ?? "Sin destino"}</strong>
          </div>

          <div className="metric-card">
            <span>Moneda</span>
            <strong>{expediente.monedaCodigo}</strong>
          </div>

          <div className="metric-card">
            <span>Total pasajeros</span>
            <strong>{expediente.totalPasajeros}</strong>
          </div>
        </div>
      </PageSection>

      <PageSection title="Pasajeros">
        <div className="expediente-summary-grid">
          <div className="metric-card">
            <span>Adultos 65+</span>
            <strong>{expediente.adultos65}</strong>
          </div>

          <div className="metric-card">
            <span>Adultos 19-64</span>
            <strong>{expediente.adultos1964}</strong>
          </div>

          <div className="metric-card">
            <span>Jóvenes 12-18</span>
            <strong>{expediente.jovenes1218}</strong>
          </div>

          <div className="metric-card">
            <span>Niños 3-11</span>
            <strong>{expediente.ninos311}</strong>
          </div>

          <div className="metric-card">
            <span>Infantes 0-2</span>
            <strong>{expediente.infantes02}</strong>
          </div>

          <div className="metric-card metric-card-highlight">
            <span>Resumen</span>
            <strong>
              {totalAdultos} adultos · {totalMenores} menores
            </strong>
          </div>
        </div>
      </PageSection>

      <PageSection title="Notas del expediente">
        <div className="grid-2">
          <div className="note-card">
            <strong>Observaciones del pasajero</strong>
            <p>{expediente.observacionesCliente ?? "Sin observaciones registradas."}</p>
          </div>

          <div className="note-card">
            <strong>Notas internas</strong>
            <p>{expediente.notasInternas ?? "Sin notas internas registradas."}</p>
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
                    <span className={`status-chip ${getVersionEstadoClass(version.estadoVersion)}`}>
                      {formatVersionEstado(version.estadoVersion)}
                    </span>
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

      <PageSection title="Confirmación y reserva">
        <div className="future-card">
          <strong>Próximo paso del flujo</strong>
          <p>
            Cuando una versión sea aceptada por el pasajero, desde aquí se podrá crear la
            confirmación comercial y posteriormente la reserva activa.
          </p>
        </div>
      </PageSection>
    </div>
  );
}