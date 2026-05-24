/* erp-tour-operator/frontend/src/pages/expediente/ExpedientesListPage.tsx */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import {
  getExpedienteEstadoClass,
  formatExpedienteEstado
} from "@/modules/cotizacion/cotizacion-labels";
import { discardCotizacion, listCotizaciones } from "@/modules/cotizacion/cotizacion-api";
import { formatDateShortEs } from "@/utils/date-format";

export function ExpedientesListPage() {
  const query = useQuery({
    queryKey: ["expedientes"],
    queryFn: () => listCotizaciones({ estado: "COTIZACION" })
  });

  const discardMutation = useMutation({
    mutationFn: discardCotizacion,
    onSuccess: () => void query.refetch()
  });

  const expedientes = (query.data ?? []) as Array<any>;

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/expedientes/new">
          Nuevo expediente
        </Link>
      }
      title="Expedientes"
    >
      <div className="list-page-intro">
        <div>
          <p className="eyebrow">Carpetas comerciales</p>
          <p className="muted">
            Cada expediente puede contener varias versiones de cotización antes de convertirse en confirmación.
          </p>
        </div>

        <span className="code-chip">
          {expedientes.length} activo{expedientes.length === 1 ? "" : "s"}
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cliente</th>
            <th>Agencia</th>
            <th>Estado</th>
            <th>Fecha viaje</th>
            <th>Versión activa</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {expedientes.map((expediente) => (
            <tr key={expediente.id}>
              <td>
                <strong>{expediente.codigo}</strong>
                <p className="table-subtext">{expediente.nombreExpediente}</p>
              </td>

              <td>{expediente.cliente?.nombreCompleto ?? "N/D"}</td>

              <td>{expediente.clienteAgente?.razonSocial ?? "WT / Directo"}</td>

              <td>
                <span className={`status-chip ${getExpedienteEstadoClass(expediente.estado)}`}>
                  {formatExpedienteEstado(expediente.estado)}
                </span>
              </td>

              <td>{formatDateShortEs(expediente.fechaViajePrincipal)}</td>

              <td>{expediente.versionPrincipal?.versionLabel ?? "Sin versión"}</td>

              <td>
                <div className="toolbar">
                  <Link className="link-button" to={`/expedientes/${expediente.id}`}>
                    Ver expediente
                  </Link>

                  <button
                    className="link-button"
                    disabled={discardMutation.isPending}
                    onClick={() => discardMutation.mutate(expediente.id)}
                    type="button"
                  >
                    Descartar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!expedientes.length ? (
        <div className="services-empty-state">
          No hay expedientes activos.
        </div>
      ) : null}
    </PageSection>
  );
}