import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { listProveedores } from "@/modules/proveedor/proveedor-api";

export function ProveedoresListPage() {
  const query = useQuery({
    queryKey: ["proveedores"],
    queryFn: listProveedores
  });

  const proveedores = (query.data ?? []) as Array<any>;

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/proveedores/new">
          Nuevo proveedor
        </Link>
      }
      title="Proveedores"
    >
      <table>
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Ubicación</th>
            <th>Tipos</th>
            <th>Servicios activos</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id}>
              <td>{proveedor.nombreComercial}</td>
              <td>
                {proveedor.pais ?? "N/D"} / {proveedor.ciudad ?? "N/D"}
              </td>
              <td>{(proveedor.tiposServicio ?? []).join(", ")}</td>
              <td>{proveedor.cantidadServiciosActivos}</td>
              <td>
                <Link className="link-button" to={`/proveedores/${proveedor.id}`}>
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
