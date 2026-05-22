/* erp-tour-operator/frontend/src/pages/CotizacionesListPage.tsx */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { discardCotizacion, listCotizaciones } from "@/modules/cotizacion/cotizacion-api";
import { formatDateShortEs } from "@/utils/date-format";

export function CotizacionesListPage() {
  const query = useQuery({
    queryKey: ["cotizaciones"],
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
        <Link className="primary-button" to="/cotizaciones/new">
          Nueva cotización
        </Link>
      }
      title="Expedientes de cotización"
    >
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Agencia</th>
            <th>Estado</th>
            <th>Fecha viaje</th>
            <th>Versión activa</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {expedientes.map((expediente) => (
            <tr key={expediente.id}>
              <td>
                <strong>{expediente.codigo}</strong>
              </td>
              <td>{expediente.clienteAgente?.razonSocial ?? "Directo"}</td>
              <td>
                <span className="status-chip status-chip-neutral">{expediente.estado}</span>
              </td>
              <td>{formatDateShortEs(expediente.fechaViajePrincipal)}</td>
              <td>{expediente.versionPrincipal?.versionLabel ?? "Sin versión"}</td>
              <td>
                <div className="toolbar">
                  <Link className="link-button" to={`/cotizaciones/${expediente.id}`}>
                    Ver carpeta
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

      {!expedientes.length ? <p>No hay expedientes de cotización activos.</p> : null}
    </PageSection>
  );
}