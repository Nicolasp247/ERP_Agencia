/* erp-tour-operator/frontend/src/pages/ClientesListPage.tsx */

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
      title="Clientes"
    >
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>
                <strong>{cliente.nombreCompleto}</strong>
              </td>
              <td>{cliente.email ?? "N/D"}</td>
              <td>{cliente.telefono ?? "N/D"}</td>
              <td>
                <span className={`status-chip ${cliente.activo ? "status-chip-active" : "status-chip-inactive"}`}>
                  {cliente.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td>
                <Link className="link-button" to={`/clientes/${cliente.id}`}>
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!clientes.length ? (
        <div className="services-empty-state">
          No hay clientes registrados.
        </div>
      ) : null}
    </PageSection>
  );
}