import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getServicio } from "@/modules/servicio/servicio-api";

export function ServicioDetailPage() {
  const params = useParams();
  const query = useQuery({
    queryKey: ["servicio", params.id],
    queryFn: () => getServicio(Number(params.id))
  });

  const servicio = query.data as any;

  if (!servicio) {
    return <PageSection title="Servicio">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/servicios/${servicio.id}/edit`}>
              Editar
            </Link>
            <Link className="link-button" to="/servicios">
              Volver
            </Link>
          </div>
        }
        title={servicio.nombreWtravel}
      >
        <div className="grid-3">
          <div>
            <strong>Tipo</strong>
            <p>{servicio.tipo.nombre}</p>
          </div>
          <div>
            <strong>Proveedor</strong>
            <p>{servicio.proveedor.nombreComercial}</p>
          </div>
          <div>
            <strong>Ciudad</strong>
            <p>{servicio.ciudad.nombre}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Tarifas">
        <table>
          <tbody>
            {(servicio.tarifas ?? []).map((tarifa: any) => (
              <tr key={`${tarifa.anio}-${tarifa.mes}-${tarifa.tipoHabitacion}`}>
                <td>
                  {tarifa.anio}/{tarifa.mes}
                </td>
                <td>{tarifa.tipoHabitacion}</td>
                <td>
                  {tarifa.precioUsd} {tarifa.monedaCodigo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
