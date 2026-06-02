/* erp-tour-operator/frontend/src/pages/agentes/AgenteDetailPage.tsx */

import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { PageSection } from "@/components/PageSection";
import { getAgente } from "@/modules/cliente-agente/cliente-agente-api";

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "N/D";
  }

  return new Date(value).toLocaleDateString();
}

function formatPct(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "N/D";
  }

  return `${Number(value).toFixed(2)}%`;
}

function findCommission(agente: any, tipoComision: "TERRESTRE" | "AEREA") {
  return agente.comisiones?.find((commission: any) => commission.tipoComision === tipoComision);
}

export function AgenteDetailPage() {
  const params = useParams();

  const query = useQuery({
    queryKey: ["agente", params.id],
    queryFn: () => getAgente(Number(params.id))
  });

  const agente = query.data as any;

  if (!agente) {
    return <PageSection title="Cliente agente">Cargando...</PageSection>;
  }

  return (
    <div className="stack">
      <PageSection
        action={
          <div className="toolbar">
            <Link className="link-button" to={`/agentes/${agente.id}/edit`}>
              Editar
            </Link>
            <Link className="link-button" to="/agentes">
              Volver
            </Link>
          </div>
        }
        title={`${agente.razonSocial} (${agente.codigo})`}
      >
        <div className="grid-3">
          <div>
            <strong>Código</strong>
            <p>{agente.codigo ?? "N/D"}</p>
          </div>

          <div>
            <strong>Razón social</strong>
            <p>{agente.razonSocial ?? "N/D"}</p>
          </div>

          <div>
            <strong>Estado</strong>
            <p>{agente.activo ? "Activo" : "Inactivo"}</p>
          </div>

          <div>
            <strong>Contacto principal</strong>
            <p>{agente.nombreContacto ?? "N/D"}</p>
          </div>

          <div>
            <strong>Email</strong>
            <p>{agente.email ?? "N/D"}</p>
          </div>

          <div>
            <strong>Teléfono</strong>
            <p>{agente.telefono ?? "N/D"}</p>
          </div>

          <div>
            <strong>Continente</strong>
            <p>{agente.continente?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>País</strong>
            <p>{agente.pais?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Ciudad</strong>
            <p>{agente.ciudad?.nombre ?? "N/D"}</p>
          </div>

          <div>
            <strong>Comisión base</strong>
            <p>{agente.comisionBasePct ?? "N/D"}</p>
          </div>

          <div>
            <strong>NIT</strong>
            <p>{agente.nit ?? "N/D"}</p>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Dirección</strong>
          <p>{agente.direccion ?? "N/D"}</p>
        </div>

                <div className="stack" style={{ marginTop: "1.5rem" }}>
          <h3>Comisiones base</h3>

          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Agente</th>
                <th>WTravel</th>
                <th>Bancario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {(["TERRESTRE", "AEREA"] as const).map((tipoComision) => {
                const commission = findCommission(agente, tipoComision);

                return (
                  <tr key={tipoComision}>
                    <td>{tipoComision === "TERRESTRE" ? "Terrestre" : "Aérea"}</td>
                    <td>{formatPct(commission?.porcentajeAgente)}</td>
                    <td>{formatPct(commission?.porcentajeWtravel)}</td>
                    <td>{formatPct(commission?.porcentajeBancario)}</td>
                    <td>{commission?.activo === false ? "Inactiva" : "Activa"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageSection>

      <PageSection title="Clientes asociados">
        {agente.clientes?.length ? (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {agente.clientes.map((cliente: any) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombreCompleto}</td>
                  <td>{cliente.activo ? "Activo" : "Inactivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay clientes asociados.</p>
        )}
      </PageSection>

      <PageSection title="Cotizaciones">
        {agente.cotizaciones?.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Fecha viaje</th>
              </tr>
            </thead>
            <tbody>
              {agente.cotizaciones.map((cotizacion: any) => (
                <tr key={cotizacion.id}>
                  <td>{cotizacion.id}</td>
                  <td>{cotizacion.nombreCotizacion}</td>
                  <td>{cotizacion.estado}</td>
                  <td>{formatDate(cotizacion.fechaViajePrincipal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay cotizaciones registradas.</p>
        )}
      </PageSection>

      <PageSection title="Reservas">
        {agente.reservas?.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Estado</th>
                <th>Fecha viaje</th>
              </tr>
            </thead>
            <tbody>
              {agente.reservas.map((reserva: any) => (
                <tr key={reserva.id}>
                  <td>{reserva.id}</td>
                  <td>{reserva.codigoReserva}</td>
                  <td>{reserva.estado}</td>
                  <td>{formatDate(reserva.fechaViajePrincipal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay reservas registradas.</p>
        )}
      </PageSection>
    </div>
  );
}