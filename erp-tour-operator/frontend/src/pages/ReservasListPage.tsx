import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { listReservas } from "@/modules/reserva/reserva-api";

export function ReservasListPage() {
  const query = useQuery({
    queryKey: ["reservas"],
    queryFn: listReservas
  });

  const reservas = (query.data ?? []) as Array<any>;

  return (
    <PageSection title="Reservas operativas">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Agencia</th>
            <th>Estado</th>
            <th>Venta confirmada</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{reserva.codigoReserva}</td>
              <td>{reserva.cliente.nombreCompleto}</td>
              <td>{reserva.clienteAgente?.razonSocial ?? "Directo"}</td>
              <td>{reserva.estado}</td>
              <td>{reserva.totalVentaConfirmada ?? "N/D"}</td>
              <td>
                <Link className="link-button" to={`/reservas/${reserva.id}`}>
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
