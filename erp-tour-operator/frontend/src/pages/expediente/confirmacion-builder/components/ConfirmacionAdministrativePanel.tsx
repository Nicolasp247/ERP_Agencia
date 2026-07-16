/* erp-tour-operator/backend/src/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto.ts */

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";

import type {
  ConfirmacionPurchase,
  ConfirmacionPurchaseCancellationType,
  ConfirmacionPurchaseFormValues,
  ConfirmacionPurchaseStatus
} from "@/modules/expediente/confirmacion-builder/confirmacion-builder-api";

type ConfirmacionAdministrativePanelProps = {
  operador: string;
  compraProveedor?: ConfirmacionPurchase | null;
  monedaCodigo: string;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (
    values: ConfirmacionPurchaseFormValues
  ) => void;
};

function isoToDateTimeLocal(
  value: string | null | undefined
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function dateTimeLocalToIso(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getCurrentTimeZone() {
  try {
    return (
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || "America/Bogota"
    );
  } catch {
    return "America/Bogota";
  }
}

export function ConfirmacionAdministrativePanel({
  operador,
  compraProveedor,
  monedaCodigo,
  isSaving = false,
  onCancel,
  onSave
}: ConfirmacionAdministrativePanelProps) {
  const [estado, setEstado] =
    useState<ConfirmacionPurchaseStatus>(
      compraProveedor?.estado ?? "PENDIENTE"
    );

  const [
    codigoConfirmacionProveedor,
    setCodigoConfirmacionProveedor
  ] = useState(
    compraProveedor
      ?.codigoConfirmacionProveedor ?? ""
  );

  const [
    fechaConfirmacion,
    setFechaConfirmacion
  ] = useState(
    compraProveedor?.fechaConfirmacion ?? ""
  );

  const [
    tipoCancelacion,
    setTipoCancelacion
  ] = useState<
    ConfirmacionPurchaseCancellationType | ""
  >(
    compraProveedor?.tipoCancelacion ?? ""
  );

  const [
    fechaLimiteCancelacion,
    setFechaLimiteCancelacion
  ] = useState(
    isoToDateTimeLocal(
      compraProveedor?.fechaLimiteCancelacion
    )
  );

  const [
    zonaHorariaCancelacion,
    setZonaHorariaCancelacion
  ] = useState(
    compraProveedor?.zonaHorariaCancelacion ??
      getCurrentTimeZone()
  );

  const [
    totalConfirmado,
    setTotalConfirmado
  ] = useState(
    compraProveedor?.totalConfirmado === null ||
      compraProveedor?.totalConfirmado ===
        undefined
      ? ""
      : String(
          compraProveedor.totalConfirmado
        )
  );

  const [
    purchaseCurrency,
    setPurchaseCurrency
  ] = useState(
    compraProveedor?.monedaCodigo ??
      monedaCodigo
  );

  const [
    notaAdministrativa,
    setNotaAdministrativa
  ] = useState(
    compraProveedor?.notaAdministrativa ?? ""
  );

  useEffect(() => {
    setEstado(
      compraProveedor?.estado ?? "PENDIENTE"
    );

    setCodigoConfirmacionProveedor(
      compraProveedor
        ?.codigoConfirmacionProveedor ?? ""
    );

    setFechaConfirmacion(
      compraProveedor?.fechaConfirmacion ?? ""
    );

    setTipoCancelacion(
      compraProveedor?.tipoCancelacion ?? ""
    );

    setFechaLimiteCancelacion(
      isoToDateTimeLocal(
        compraProveedor
          ?.fechaLimiteCancelacion
      )
    );

    setZonaHorariaCancelacion(
      compraProveedor
        ?.zonaHorariaCancelacion ??
        getCurrentTimeZone()
    );

    setTotalConfirmado(
      compraProveedor?.totalConfirmado ===
        null ||
        compraProveedor?.totalConfirmado ===
          undefined
        ? ""
        : String(
            compraProveedor.totalConfirmado
          )
    );

    setPurchaseCurrency(
      compraProveedor?.monedaCodigo ??
        monedaCodigo
    );

    setNotaAdministrativa(
      compraProveedor
        ?.notaAdministrativa ?? ""
    );
  }, [compraProveedor, monedaCodigo]);

  const panelTitle = compraProveedor
    ? "Editar confirmación del operador"
    : "Registrar confirmación del operador";

  const showCancellationDeadline =
    tipoCancelacion === "GRATUITA_HASTA";

  const statusHelp = useMemo(() => {
    if (estado === "PENDIENTE") {
      return "Todavía no se ha solicitado ni confirmado el servicio.";
    }

    if (estado === "SOLICITADA") {
      return "La reserva fue solicitada al operador y está pendiente de respuesta.";
    }

    if (estado === "CONFIRMADA") {
      return "El operador confirmó la prestación del servicio.";
    }

    return "La compra o reserva fue cancelada.";
  }, [estado]);

  function submitForm(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedTotal = totalConfirmado.trim()
      ? Number(totalConfirmado)
      : null;

    onSave({
      estado,

      codigoConfirmacionProveedor:
        codigoConfirmacionProveedor.trim() ||
        null,

      fechaConfirmacion:
        fechaConfirmacion || null,

      tipoCancelacion:
        tipoCancelacion || null,

      fechaLimiteCancelacion:
        showCancellationDeadline
          ? dateTimeLocalToIso(
              fechaLimiteCancelacion
            )
          : null,

      zonaHorariaCancelacion:
        showCancellationDeadline
          ? zonaHorariaCancelacion.trim() ||
            null
          : null,

      totalConfirmado:
        parsedTotal !== null &&
        Number.isFinite(parsedTotal)
          ? parsedTotal
          : null,

      monedaCodigo:
        purchaseCurrency
          .trim()
          .toUpperCase(),

      notaAdministrativa:
        notaAdministrativa.trim() || null
    });
  }

  return (
    <form
      className="confirmacion-admin-panel"
      onSubmit={submitForm}
    >
      <div className="confirmacion-admin-heading">
        <div>
          <p className="eyebrow">
            Gestión administrativa
          </p>

          <h3>{panelTitle}</h3>

          <p>
            Operador:{" "}
            <strong>{operador}</strong>
          </p>
        </div>

        {compraProveedor ? (
          <div className="confirmacion-admin-code">
            <span>Código interno</span>
            <strong>
              {compraProveedor.codigoInterno}
            </strong>
          </div>
        ) : null}
      </div>

      <div className="confirmacion-admin-grid">
        <label>
          <span>Estado</span>

          <select
            disabled={isSaving}
            onChange={(event) =>
              setEstado(
                event.target
                  .value as ConfirmacionPurchaseStatus
              )
            }
            value={estado}
          >
            <option value="PENDIENTE">
              Pendiente
            </option>

            <option value="SOLICITADA">
              Solicitada
            </option>

            <option value="CONFIRMADA">
              Confirmada
            </option>

            <option value="CANCELADA">
              Cancelada
            </option>
          </select>

          <small>{statusHelp}</small>
        </label>

        <label>
          <span>
            Código de confirmación
          </span>

          <input
            disabled={isSaving}
            maxLength={120}
            onChange={(event) =>
              setCodigoConfirmacionProveedor(
                event.target.value
              )
            }
            placeholder="Ej: T451238"
            value={
              codigoConfirmacionProveedor
            }
          />
        </label>

        <label>
          <span>Fecha de confirmación</span>

          <input
            disabled={isSaving}
            onChange={(event) =>
              setFechaConfirmacion(
                event.target.value
              )
            }
            type="date"
            value={fechaConfirmacion}
          />
        </label>

        <label>
          <span>
            Política de cancelación
          </span>

          <select
            disabled={isSaving}
            onChange={(event) =>
              setTipoCancelacion(
                event.target.value as
                  | ConfirmacionPurchaseCancellationType
                  | ""
              )
            }
            value={tipoCancelacion}
          >
            <option value="">
              Sin definir
            </option>

            <option value="GRATUITA_HASTA">
              Gratuita hasta una fecha
            </option>

            <option value="NO_REEMBOLSABLE">
              No reembolsable
            </option>

            <option value="CONDICIONES_ESPECIALES">
              Condiciones especiales
            </option>
          </select>
        </label>

        {showCancellationDeadline ? (
          <>
            <label>
              <span>
                Cancelación gratuita hasta
              </span>

              <input
                disabled={isSaving}
                onChange={(event) =>
                  setFechaLimiteCancelacion(
                    event.target.value
                  )
                }
                type="datetime-local"
                value={
                  fechaLimiteCancelacion
                }
              />
            </label>

            <label>
              <span>Zona horaria</span>

              <input
                disabled={isSaving}
                maxLength={80}
                onChange={(event) =>
                  setZonaHorariaCancelacion(
                    event.target.value
                  )
                }
                placeholder="America/Bogota"
                value={
                  zonaHorariaCancelacion
                }
              />
            </label>
          </>
        ) : null}

        <label>
          <span>
            Precio total confirmado
          </span>

          <input
            disabled={isSaving}
            min="0"
            onChange={(event) =>
              setTotalConfirmado(
                event.target.value
              )
            }
            placeholder="0.00"
            step="0.01"
            type="number"
            value={totalConfirmado}
          />
        </label>

        <label>
          <span>Moneda</span>

          <input
            disabled={isSaving}
            maxLength={3}
            minLength={3}
            onChange={(event) =>
              setPurchaseCurrency(
                event.target.value.toUpperCase()
              )
            }
            placeholder="USD"
            required
            value={purchaseCurrency}
          />
        </label>

        <label className="confirmacion-admin-notes">
          <span>Notas administrativas</span>

          <textarea
            disabled={isSaving}
            onChange={(event) =>
              setNotaAdministrativa(
                event.target.value
              )
            }
            placeholder="Condiciones, contacto del operador, observaciones de la compra..."
            value={notaAdministrativa}
          />
        </label>
      </div>

      <div className="confirmacion-admin-actions">
        <button
          className="link-button"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>

        <button
          className="primary-button"
          disabled={
            isSaving ||
            purchaseCurrency.trim().length !== 3
          }
          type="submit"
        >
          {isSaving
            ? "Guardando..."
            : compraProveedor
              ? "Guardar cambios"
              : "Crear confirmación"}
        </button>
      </div>
    </form>
  );
}