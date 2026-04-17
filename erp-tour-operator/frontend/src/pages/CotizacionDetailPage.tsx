import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { convertCotizacion, discardCotizacion, getCotizacion } from "@/modules/cotizacion/cotizacion-api";
import { openPdf } from "@/utils/pdf";

export function CotizacionDetailPage() {
  const navigate = useNavigate();
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

  const convertMutation = useMutation({
    mutationFn: () => convertCotizacion(id),
    onSuccess: (data: any) => navigate(`/reservas/${data.id}`)
  });

  const cotizacion = query.data as any;

  if (!cotizacion) {
    return <PageSection title="Cotización">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/cotizaciones/${id}/edit`}>
              Editar
            </Link>
            <button className="link-button" onClick={() => void openPdf(`/documento/cotizacion/${id}/pdf`)} type="button">
              PDF
            </button>
            <button className="link-button" onClick={() => discardMutation.mutate()} type="button">
              Descartar
            </button>
            <button className="primary-button" onClick={() => convertMutation.mutate()} type="button">
              Convertir
            </button>
          </div>
        }
        title={`${cotizacion.codigo} · ${cotizacion.nombreCotizacion}`}
      >
        <div className="grid-3">
          <div>
            <strong>Cliente</strong>
            <p>{cotizacion.cliente.nombreCompleto}</p>
          </div>
          <div>
            <strong>Agencia</strong>
            <p>{cotizacion.clienteAgente?.razonSocial ?? "Directo"}</p>
          </div>
          <div>
            <strong>Total venta</strong>
            <p>{cotizacion.totales.totalVenta}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Itinerario">
        <table>
          <tbody>
            {cotizacion.items.map((item: any) => (
              <tr key={item.id}>
                <td>{new Date(item.fechaServicio).toISOString().slice(0, 10)}</td>
                <td>{item.servicio.nombreWtravel}</td>
                <td>{item.precioVenta ?? "N/D"}</td>
                <td>{item.esOpcional ? "Opcional" : "Incluido"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
