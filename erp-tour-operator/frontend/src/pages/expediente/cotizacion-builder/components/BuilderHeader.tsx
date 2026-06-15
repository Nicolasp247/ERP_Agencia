/* erp-tour-operator/frontend/src/pages/expediente/cotizacion-builder/components/BuilderHeader.tsx */

import { Link } from "react-router-dom";

import { formatDateShortEs } from "@/utils/date-format";

type BuilderHeaderProps = {
  expediente: any;
  version: any;
};

export function BuilderHeader({ expediente, version }: BuilderHeaderProps) {
  return (
    <div className="builder-header-card">
      <h2>Construir cotización</h2>

      <div className="builder-header-inner">
        <div>
          <h3>{expediente.codigo}</h3>
          <p className="muted">
            {version?.versionLabel ?? "Cotización"} · Cliente:{" "}
            {expediente.cliente?.nombreCompleto ?? "N/D"} · Agencia:{" "}
            {expediente.clienteAgente?.razonSocial ?? "WT / Directo"}
          </p>
        </div>

        <div className="builder-header-meta">
          <span>{formatDateShortEs(expediente.fechaViajePrincipal)}</span>
          <span>{expediente.totalPasajeros} pasajeros</span>
          <span>{expediente.monedaCodigo}</span>
        </div>

        <div className="toolbar">
          <Link className="link-button" to={`/expedientes/${expediente.id}`}>
            Volver al expediente
          </Link>

          <button className="primary-button" type="button">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}