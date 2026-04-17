import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { listServicios } from "@/modules/servicio/servicio-api";

export function ServiciosListPage() {
  const query = useQuery({
    queryKey: ["servicios"],
    queryFn: listServicios
  });

  const servicios = (query.data ?? []) as Array<any>;

  return (
    <PageSection
      action={
        <Link className="primary-button" to="/servicios/new">
          Nuevo servicio
        </Link>
      }
      title="Servicios turísticos"
    >
      <table>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Tipo</th>
            <th>Proveedor</th>
            <th>Ciudad</th>
            <th>Precio base</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <tr key={servicio.id}>
              <td>{servicio.nombreWtravel}</td>
              <td>{servicio.tipo}</td>
              <td>{servicio.proveedor}</td>
              <td>{servicio.ciudad}</td>
              <td>
                {servicio.precioBase ?? "Sin tarifa"} {servicio.monedaCodigo ?? ""}
              </td>
              <td>
                <Link className="link-button" to={`/servicios/${servicio.id}`}>
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
