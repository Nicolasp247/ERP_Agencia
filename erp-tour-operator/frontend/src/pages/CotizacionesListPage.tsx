/* erp-tour-operator/frontend/src/pages/CotizacionesListPage.tsx */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { convertCotizacion, discardCotizacion, listCotizaciones } from "@/modules/cotizacion/cotizacion-api";

export function CotizacionesListPage() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["cotizaciones"],
    queryFn: () => listCotizaciones({ estado: "ACTIVA" })
  });

  const discardMutation = useMutation({
    mutationFn: discardCotizacion,
    onSuccess: () => void query.refetch()
  });

  const convertMutation = useMutation({
    mutationFn: convertCotizacion,
    onSuccess: (data: any) => navigate(`/reservas/${data.id}`)
  });

  const cotizaciones = (query.data ?? []) as Array<any>;

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/cotizaciones/new">
          Nueva cotización
        </Link>
      }
      title="Cotizaciones activas"
    >
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Agencia</th>
            <th>Fecha viaje</th>
            <th>Total venta</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((cotizacion) => (
            <tr key={cotizacion.id}>
              <td>{cotizacion.codigo}</td>
              <td>{cotizacion.cliente.nombreCompleto}</td>
              <td>{cotizacion.clienteAgente?.razonSocial ?? "Directo"}</td>
              <td>{new Date(cotizacion.fechaViajePrincipal).toISOString().slice(0, 10)}</td>
              <td>{cotizacion.totalVenta}</td>
              <td>
                <div className="toolbar">
                  <Link className="link-button" to={`/cotizaciones/${cotizacion.id}`}>
                    Ver
                  </Link>
                  <button className="link-button" onClick={() => discardMutation.mutate(cotizacion.id)} type="button">
                    Descartar
                  </button>
                  <button className="primary-button" onClick={() => convertMutation.mutate(cotizacion.id)} type="button">
                    Convertir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageSection>
  );
}
