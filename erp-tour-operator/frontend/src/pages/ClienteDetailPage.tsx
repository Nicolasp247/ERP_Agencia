import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getCliente } from "@/modules/cliente/cliente-api";

export function ClienteDetailPage() {
  const params = useParams();
  const query = useQuery({
    queryKey: ["cliente", params.id],
    queryFn: () => getCliente(Number(params.id))
  });

  const cliente = query.data as any;

  if (!cliente) {
    return <PageSection title="Cliente">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/clientes/${cliente.id}/edit`}>
              Editar
            </Link>
            <Link className="link-button" to="/clientes">
              Volver
            </Link>
          </div>
        }
        title={cliente.nombreCompleto}
      >
        <div className="grid-3">
          <div>
            <strong>Agencia</strong>
            <p>{cliente.clienteAgente?.razonSocial ?? "Directo"}</p>
          </div>
          <div>
            <strong>Ubicación</strong>
            <p>
              {cliente.pais?.nombre ?? "N/D"} / {cliente.ciudad?.nombre ?? "N/D"}
            </p>
          </div>
          <div>
            <strong>Estado</strong>
            <p>{cliente.activo ? "Activo" : "Inactivo"}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Historial">
        <table>
          <tbody>
            {cliente.historial.map((item: any) => (
              <tr key={`${item.tipo}-${item.id}`}>
                <td>{item.tipo}</td>
                <td>{item.referencia}</td>
                <td>{item.estado}</td>
                <td>{new Date(item.fechaViajePrincipal).toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
