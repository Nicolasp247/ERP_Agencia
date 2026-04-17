import { useQuery } from "@tanstack/react-query";

import { PageSection } from "@/components/PageSection";
import { fetchOverview, fetchUtilidadPorReserva } from "@/modules/reportes/reportes-api";

export function ReportesPage() {
  const overviewQuery = useQuery({
    queryKey: ["reportes-overview"],
    queryFn: fetchOverview
  });

  const utilidadQuery = useQuery({
    queryKey: ["reportes-utilidad"],
    queryFn: fetchUtilidadPorReserva
  });

  const overview = overviewQuery.data ?? {
    cotizacionesActivas: 0,
    cotizacionesDescartadas: 0,
    reservas: 0,
    liquidaciones: 0
  };

  return (
    <div className="stack">
      <PageSection subtitle="Lectura gerencial rápida del negocio." title="Resumen global">
        <div className="grid-4">
          <div className="panel">
            <strong>Cotizaciones activas</strong>
            <p>{overview.cotizacionesActivas}</p>
          </div>
          <div className="panel">
            <strong>Cotizaciones descartadas</strong>
            <p>{overview.cotizacionesDescartadas}</p>
          </div>
          <div className="panel">
            <strong>Reservas</strong>
            <p>{overview.reservas}</p>
          </div>
          <div className="panel">
            <strong>Liquidaciones</strong>
            <p>{overview.liquidaciones}</p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Utilidad por reserva">
        <table>
          <thead>
            <tr>
              <th>Reserva</th>
              <th>Cliente</th>
              <th>Agencia</th>
              <th>Venta</th>
              <th>Costo</th>
              <th>Utilidad</th>
            </tr>
          </thead>
          <tbody>
            {((utilidadQuery.data ?? []) as Array<any>).map((item) => (
              <tr key={item.idReserva}>
                <td>{item.codigoReserva}</td>
                <td>{item.cliente}</td>
                <td>{item.clienteAgente ?? "Directo"}</td>
                <td>{item.totalVentaConfirmada}</td>
                <td>{item.totalCostoReal}</td>
                <td>{item.utilidadBrutaTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
