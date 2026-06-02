/* erp-tour-operator/frontend/src/pages/agentes/AgentesListPage.tsx */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { listAgentes } from "@/modules/cliente-agente/cliente-agente-api";

function formatPct(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "N/D";
  }

  return `${Number(value).toFixed(2)}%`;
}

function findCommission(agente: any, tipoComision: "TERRESTRE" | "AEREA") {
  return agente.comisiones?.find((commission: any) => commission.tipoComision === tipoComision);
}

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
      subtitle="Agencias intermediarias, reglas de comisión y trazabilidad comercial."
      title="Clientes agente"
    >
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Razón social</th>
            <th>Contacto</th>
            <th>Comisión terrestre</th>
            <th>Comisión aérea</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {agentes.map((agente) => {
            const terrestre = findCommission(agente, "TERRESTRE");
            const aerea = findCommission(agente, "AEREA");

            return (
              <tr key={agente.id}>
                <td>{agente.codigo}</td>
                <td>{agente.razonSocial}</td>
                <td>{agente.nombreContacto ?? "N/D"}</td>
                <td>{formatPct(terrestre?.porcentajeAgente ?? agente.comisionBasePct)}</td>
                <td>{formatPct(aerea?.porcentajeAgente)}</td>
                <td>{agente.activo ? "Activo" : "Inactivo"}</td>
                <td>
                  <Link className="link-button" to={`/agentes/${agente.id}`}>
                    Ver detalle
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PageSection>
  );
}