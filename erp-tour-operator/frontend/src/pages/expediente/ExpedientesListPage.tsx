/* erp-tour-operator/frontend/src/pages/expediente/ExpedientesListPage.tsx */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import {
  getExpedienteEstadoClass,
  formatExpedienteEstado
} from "@/modules/expediente/expediente-labels";
import { discardExpedientes, listExpedientes } from "@/modules/expediente/expediente-api";
import { formatDateShortEs } from "@/utils/date-format";

type ExpedienteEstadoFiltro = "COTIZACION" | "CONFIRMACION" | "DESCARTADO" | "YA_VIAJARON";

type ExpedienteTableProps = {
  title: string;
  description: string;
  emptyText: string;
  expedientes: Array<any>;
  showDiscardAction?: boolean;
  isDiscarding?: boolean;
  onDiscard?: (id: number) => void;
};

function getPageMode(pathname: string) {
  if (pathname.includes("/expedientes/descartados")) {
    return "DESCARTADOS";
  }

  if (pathname.includes("/expedientes/ya-viajaron")) {
    return "YA_VIAJARON";
  }

  return "ACTIVOS";
}

function ExpedienteTable({
  title,
  description,
  emptyText,
  expedientes,
  showDiscardAction = false,
  isDiscarding = false,
  onDiscard
}: ExpedienteTableProps) {
  return (
    <section className="expediente-list-section">
      <div className="expediente-list-section-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <span className="code-chip">
          {expedientes.length} expediente{expedientes.length === 1 ? "" : "s"}
        </span>
      </div>

      <table className="expedientes-main-table">
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

                  {showDiscardAction ? (
                    <button
                      className="link-button"
                      disabled={isDiscarding}
                      onClick={() => onDiscard?.(expediente.id)}
                      type="button"
                    >
                      Descartar
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!expedientes.length ? (
        <div className="services-empty-state">{emptyText}</div>
      ) : null}
    </section>
  );
}

export function ExpedientesListPage() {
  const location = useLocation();
  const pageMode = getPageMode(location.pathname);

  const cotizacionesQuery = useQuery({
    queryKey: ["expedientes", "COTIZACION"],
    queryFn: () => listExpedientes({ estado: "COTIZACION" }),
    enabled: pageMode === "ACTIVOS"
  });

  const confirmacionesQuery = useQuery({
    queryKey: ["expedientes", "CONFIRMACION"],
    queryFn: () => listExpedientes({ estado: "CONFIRMACION" }),
    enabled: pageMode === "ACTIVOS"
  });

  const descartadosQuery = useQuery({
    queryKey: ["expedientes", "DESCARTADO"],
    queryFn: () => listExpedientes({ estado: "DESCARTADO" }),
    enabled: pageMode === "DESCARTADOS"
  });

  const yaViajaronQuery = useQuery({
    queryKey: ["expedientes", "YA_VIAJARON"],
    queryFn: () => listExpedientes({ estado: "YA_VIAJARON" }),
    enabled: pageMode === "YA_VIAJARON"
  });

  const discardMutation = useMutation({
    mutationFn: discardExpedientes,
    onSuccess: () => {
      void cotizacionesQuery.refetch();
      void confirmacionesQuery.refetch();
      void descartadosQuery.refetch();
      void yaViajaronQuery.refetch();
    }
  });

  const cotizaciones = (cotizacionesQuery.data ?? []) as Array<any>;
  const confirmaciones = (confirmacionesQuery.data ?? []) as Array<any>;
  const descartados = (descartadosQuery.data ?? []) as Array<any>;
  const yaViajaron = (yaViajaronQuery.data ?? []) as Array<any>;

  const isLoading =
    cotizacionesQuery.isLoading ||
    confirmacionesQuery.isLoading ||
    descartadosQuery.isLoading ||
    yaViajaronQuery.isLoading;

  if (pageMode === "DESCARTADOS") {
    return (
      <PageSection
        action={
          <div className="expediente-list-actions">
            <Link className="link-button" to="/expedientes">
              Volver a activos
            </Link>
            <Link className="primary-button" to="/expedientes/new">
              Nuevo expediente
            </Link>
          </div>
        }
        title="Expedientes descartados"
      >
        <div className="list-page-intro">
          <div>
            <p className="eyebrow">Archivo comercial</p>
            <p className="muted">
              Aquí se muestran los expedientes descartados. No aparecen en la pantalla principal.
            </p>
          </div>

          <span className="code-chip">
            {descartados.length} descartado{descartados.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="services-empty-state">Cargando expedientes descartados...</div>
        ) : (
          <ExpedienteTable
            title="Descartados"
            description="Negocios que no continuaron en el flujo comercial."
            emptyText="No hay expedientes descartados."
            expedientes={descartados}
          />
        )}
      </PageSection>
    );
  }

  if (pageMode === "YA_VIAJARON") {
    return (
      <PageSection
        action={
          <div className="expediente-list-actions">
            <Link className="link-button" to="/expedientes">
              Volver a activos
            </Link>
            <Link className="primary-button" to="/expedientes/new">
              Nuevo expediente
            </Link>
          </div>
        }
        title="Expedientes ya viajaron"
      >
        <div className="list-page-intro">
          <div>
            <p className="eyebrow">Histórico operativo</p>
            <p className="muted">
              Aquí se muestran los expedientes cuyo viaje ya fue realizado.
            </p>
          </div>

          <span className="code-chip">
            {yaViajaron.length} expediente{yaViajaron.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="services-empty-state">Cargando expedientes ya viajados...</div>
        ) : (
          <ExpedienteTable
            title="Ya viajaron"
            description="Expedientes finalizados o archivados después del viaje."
            emptyText="No hay expedientes marcados como ya viajaron."
            expedientes={yaViajaron}
          />
        )}
      </PageSection>
    );
  }

  const totalActivos = cotizaciones.length + confirmaciones.length;

  return (
    <PageSection
      action={
        <div className="expediente-list-actions">
          <Link className="link-button" to="/expedientes/descartados">
            Ver descartados
          </Link>

          <Link className="link-button" to="/expedientes/ya-viajaron">
            Ver ya viajaron
          </Link>

          <Link className="primary-button" to="/expedientes/new">
            Nuevo expediente
          </Link>
        </div>
      }
      title="Expedientes"
    >
      <div className="list-page-intro">
        <div>
          <p className="eyebrow">Carpetas comerciales</p>
          <p className="muted">
            Cada expediente puede estar en cotización o confirmación antes de pasar a reserva, viaje y liquidación.
          </p>
        </div>

        <span className="code-chip">
          {totalActivos} activo{totalActivos === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <div className="services-empty-state">Cargando expedientes activos...</div>
      ) : (
        <div className="expediente-list-stack">
          <ExpedienteTable
            title="Cotizaciones activas"
            description="Expedientes que todavía están en etapa comercial de cotización."
            emptyText="No hay expedientes en cotización."
            expedientes={cotizaciones}
            showDiscardAction
            isDiscarding={discardMutation.isPending}
            onDiscard={(id) => discardMutation.mutate(id)}
          />

          <ExpedienteTable
            title="Confirmaciones activas"
            description="Expedientes aceptados que ya pasaron a confirmación y preparación operativa."
            emptyText="No hay expedientes en confirmación."
            expedientes={confirmaciones}
          />
        </div>
      )}
    </PageSection>
  );
}