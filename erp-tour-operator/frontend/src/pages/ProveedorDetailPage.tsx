import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getProveedor } from "@/modules/proveedor/proveedor-api";

export function ProveedorDetailPage() {
  const params = useParams();
  const query = useQuery({
    queryKey: ["proveedor", params.id],
    queryFn: () => getProveedor(Number(params.id))
  });

  const proveedor = query.data as any;

  if (!proveedor) {
    return <PageSection title="Proveedor">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/proveedores/${proveedor.id}/edit`}>
              Editar
            </Link>
            <Link className="link-button" to="/proveedores">
              Volver
            </Link>
          </div>
        }
        title={proveedor.nombreComercial}
      >
        <div className="grid-3">
          <div>
            <strong>Código</strong>
            <p>{proveedor.codigo ?? "N/D"}</p>
          </div>
          <div>
            <strong>Ubicación</strong>
            <p>
              {proveedor.pais?.nombre ?? "N/D"} / {proveedor.ciudad?.nombre ?? "N/D"}
            </p>
          </div>
          <div>
            <strong>Web</strong>
            <p>{proveedor.sitioWeb ?? "N/D"}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Contactos">
        <table>
          <tbody>
            {proveedor.contactos.map((contacto: any) => (
              <tr key={contacto.id}>
                <td>{contacto.nombreContacto ?? "Sin nombre"}</td>
                <td>{contacto.email}</td>
                <td>{contacto.telefono ?? "N/D"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
