import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { listAgentes } from "@/modules/cliente-agente/cliente-agente-api";

export function AgentesListPage() {
  const query = useQuery({
    queryKey: ["agentes"],
    queryFn: listAgentes
  });

  const agentes = (query.data ?? []) as Array<any>;

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/agentes/new">
          Nuevo agente
        </Link>
      }
      subtitle="Agencias intermediarias, comisión base y trazabilidad comercial."
      title="Clientes agente"
    >
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Razón social</th>
            <th>Contacto</th>
            <th>Comisión</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {agentes.map((agente) => (
            <tr key={agente.id}>
              <td>{agente.codigo}</td>
              <td>{agente.razonSocial}</td>
              <td>{agente.nombreContacto ?? "N/D"}</td>
              <td>{agente.comisionBasePct ?? "N/D"}</td>
              <td>{agente.activo ? "Activo" : "Inactivo"}</td>
              <td>
                <Link className="link-button" to={`/agentes/${agente.id}`}>
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageSection>
  );
}
