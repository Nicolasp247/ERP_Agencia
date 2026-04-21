import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getCliente } from "@/modules/cliente/cliente-api";

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "N/D";
  }

  return new Date(value).toLocaleDateString();
}

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
            <strong>Nombre completo</strong>
            <p>{cliente.nombreCompleto ?? "N/D"}</p>
          </div>

          <div>
            <strong>Estado</strong>
            <p>{cliente.activo ? "Activo" : "Inactivo"}</p>
          </div>

          <div>
            <strong>Agencia asociada</strong>
            <p>{cliente.clienteAgente?.razonSocial ?? "Directo"}</p>
          </div>

          <div>
            <strong>Continente</strong>
            <p>{cliente.continente?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>País</strong>
            <p>{cliente.pais?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Ciudad</strong>
            <p>{cliente.ciudad?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Email</strong>
            <p>{cliente.email ?? "N/D"}</p>
          </div>

          <div>
            <strong>Teléfono</strong>
            <p>{cliente.telefono ?? "N/D"}</p>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Observaciones</strong>
          <p>{cliente.observaciones ?? "N/D"}</p>
        </div>
      </PageSection>

      <PageSection title="Historial">
        {cliente.historial?.length ? (
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Referencia</th>
                <th>Estado</th>
                <th>Fecha viaje</th>
              </tr>
            </thead>
            <tbody>
              {cliente.historial.map((item: any) => (
                <tr key={`${item.tipo}-${item.id}`}>
                  <td>{item.tipo}</td>
                  <td>{item.referencia}</td>
                  <td>{item.estado}</td>
                  <td>{formatDate(item.fechaViajePrincipal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay historial registrado.</p>
        )}
      </PageSection>
    </div>
  );
}