import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { listClientes } from "@/modules/cliente/cliente-api";

export function ClientesListPage() {
  const query = useQuery({
    queryKey: ["clientes"],
    queryFn: listClientes
  });

  const clientes = (query.data ?? []) as Array<any>;

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/clientes/new">
          Nuevo cliente
        </Link>
      }
      title="Clientes finales"
    >
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Agencia</th>
            <th>País / Ciudad</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombreCompleto}</td>
              <td>{cliente.clienteAgente?.razonSocial ?? "Directo"}</td>
              <td>
                {cliente.pais ?? "N/D"} / {cliente.ciudad ?? "N/D"}
              </td>
              <td>{cliente.activo ? "Activo" : "Inactivo"}</td>
              <td>
                <Link className="link-button" to={`/clientes/${cliente.id}`}>
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
