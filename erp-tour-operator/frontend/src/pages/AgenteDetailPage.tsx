import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getAgente } from "@/modules/cliente-agente/cliente-agente-api";

export function AgenteDetailPage() {
  const params = useParams();
  const query = useQuery({
    queryKey: ["agente", params.id],
    queryFn: () => getAgente(Number(params.id))
  });

  const agente = query.data as any;

  if (!agente) {
    return <PageSection title="Cliente agente">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/agentes/${agente.id}/edit`}>
              Editar
            </Link>
            <Link className="link-button" to="/agentes">
              Volver
            </Link>
          </div>
        }
        title={`${agente.razonSocial} (${agente.codigo})`}
      >
        <div className="grid-3">
          <div>
            <strong>Contacto</strong>
            <p>{agente.nombreContacto ?? "N/D"}</p>
          </div>
          <div>
            <strong>Ubicación</strong>
            <p>
              {agente.pais?.nombre ?? "N/D"} / {agente.ciudad?.nombre ?? "N/D"}
            </p>
          </div>
          <div>
            <strong>Comisión base</strong>
            <p>{agente.comisionBasePct ?? "N/D"}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Clientes asociados">
        <table>
          <tbody>
            {agente.clientes.map((cliente: any) => (
              <tr key={cliente.id}>
                <td>{cliente.nombreCompleto}</td>
                <td>{cliente.activo ? "Activo" : "Inactivo"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
