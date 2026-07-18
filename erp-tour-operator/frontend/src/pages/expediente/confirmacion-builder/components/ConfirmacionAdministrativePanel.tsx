/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionAdministrativePanel.tsx */

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

type ConfirmacionAdministrativeColumn = {
  id: number;
  label?: string;
  grupo: string;
  nombre: string;
  multiplicador: number;
};

type ConfirmacionAdministrativeRow = {
  fecha: string | null;
  fechaFin?: string | null;
  servicioIncluido: string;

  precios: Array<{
    columnId: number;
    precioCotizado: number | null;
    precioConfirmado: number | null;
  }>;
};

type ConfirmacionAdministrativePanelProps = {
  operador: string;
  compraProveedor?: ConfirmacionPurchase | null;
  monedaCodigo: string;
  columns: ConfirmacionAdministrativeColumn[];
  row: ConfirmacionAdministrativeRow;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (values: ConfirmacionPurchaseFormValues) => void;
};

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic"
];

function isoToDisplayInput(
  value: string | null | undefined
) {
  if (!value) {
    return "";
  }

  const match = String(value)
    .slice(0, 10)
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return "";
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function displayInputToIso(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return null;
  }

  const match = cleanValue.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValid) {
    return null;
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function formatAdministrativeDate(
  value: string | null | undefined
) {
  if (!value) {
    return "Sin fecha";
  }

  const match = String(value)
    .slice(0, 10)
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  const year = match[1];
  const monthNumber = Number(match[2]);
  const day = match[3];

  const monthLabel =
    MONTH_LABELS[monthNumber - 1] ?? "";

  return `${day}/${monthLabel}(${match[2]})/${year}`;
}

function getColumnLabel(
  column: ConfirmacionAdministrativeColumn
) {
  return (
    column.label ||
    `${column.grupo} ${column.nombre}`
      .replaceAll("*", " estrellas")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function formatServiceDate(
  startValue: string | null,
  endValue?: string | null
) {
  if (!startValue) {
    return "Sin fecha";
  }

  const format = (value: string) => {
    const date = new Date(
      `${value}T00:00:00.000Z`
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  };

  if (
    !endValue ||
    endValue === startValue
  ) {
    return format(startValue);
  }

  return `${format(startValue)} al ${format(endValue)}`;
}

function formatMoney(
  value: number | null | undefined,
  currency: string
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }

  return `${Number(value).toFixed(2)} ${currency}`;
}

function normalizeDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function ConfirmacionAdministrativePanel({
  operador,
  compraProveedor,
  monedaCodigo,
  columns,
  row,
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
    compraProveedor?.codigoConfirmacionProveedor ?? ""
  );

  const [
    fechaConfirmacion,
    setFechaConfirmacion
  ] = useState(
    isoToDisplayInput(
      compraProveedor?.fechaConfirmacion
    )
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
    isoToDisplayInput(
      compraProveedor?.fechaLimiteCancelacion
    )
  );

  const [
    totalPagado,
    setTotalPagado
  ] = useState(
    compraProveedor?.totalPagado === null ||
      compraProveedor?.totalPagado === undefined
      ? ""
      : String(compraProveedor.totalPagado)
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
      isoToDisplayInput(
        compraProveedor?.fechaConfirmacion
      )
    );

    setTipoCancelacion(
      compraProveedor?.tipoCancelacion ?? ""
    );

    setFechaLimiteCancelacion(
      isoToDisplayInput(
        compraProveedor?.fechaLimiteCancelacion
      )
    );

    setTotalPagado(
      compraProveedor?.totalPagado === null ||
        compraProveedor?.totalPagado ===
          undefined
        ? ""
        : String(
            compraProveedor.totalPagado
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

  const showCancellationDeadline =
    tipoCancelacion === "GRATUITA_HASTA";

  const automaticColumn = useMemo(() => {
    if (compraProveedor?.columnaSeleccionada) {
      return (
        columns.find(
          (column) =>
            column.id ===
            compraProveedor.columnaSeleccionada?.id
        ) ?? null
      );
    }

    const columnsWithPrice = columns.filter(
      (column) => {
        const price = row.precios.find(
          (item) =>
            item.columnId === column.id
        );

        return (
          price?.precioConfirmado !== null &&
          price?.precioConfirmado !== undefined
        ) || (
          price?.precioCotizado !== null &&
          price?.precioCotizado !== undefined
        );
      }
    );

    if (!columnsWithPrice.length) {
      return null;
    }

    return columnsWithPrice[0];
  }, [
    columns,
    row.precios,
    compraProveedor?.columnaSeleccionada
  ]);

  const dividedPaidValue = useMemo(() => {
    if (
      !automaticColumn ||
      !totalPagado.trim()
    ) {
      return null;
    }

    const parsedTotal = Number(totalPagado);

    if (!Number.isFinite(parsedTotal)) {
      return null;
    }

    const multiplier = Math.max(
      Number(
        automaticColumn.multiplicador ?? 1
      ),
      1
    );

    return parsedTotal / multiplier;
  }, [automaticColumn, totalPagado]);

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

    if (estado === "PAGAR_DESPUES") {
      return "El servicio está confirmado, pero el pago se realizará posteriormente.";
    }

    return "La compra o reserva fue cancelada.";
  }, [estado]);

  function submitForm(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedConfirmationDate =
      displayInputToIso(fechaConfirmacion);

    const parsedCancellationDate =
      showCancellationDeadline
        ? displayInputToIso(
            fechaLimiteCancelacion
          )
        : null;

    const parsedTotal =
      totalPagado.trim()
        ? Number(totalPagado)
        : null;

    if (
      fechaConfirmacion.trim() &&
      !parsedConfirmationDate
    ) {
      window.alert(
        "La fecha de confirmación debe tener formato dd/mm/yyyy."
      );
      return;
    }

    if (
      showCancellationDeadline &&
      fechaLimiteCancelacion.trim() &&
      !parsedCancellationDate
    ) {
      window.alert(
        "La fecha máxima de cancelación debe tener formato dd/mm/yyyy."
      );
      return;
    }

    if (
      parsedTotal !== null &&
      (
        !Number.isFinite(parsedTotal) ||
        parsedTotal < 0
      )
    ) {
      window.alert(
        "El precio total pagado debe ser un valor válido."
      );
      return;
    }

    onSave({
      estado,

      codigoConfirmacionProveedor:
        codigoConfirmacionProveedor.trim() ||
        null,

      fechaConfirmacion:
        parsedConfirmationDate,

      tipoCancelacion:
        tipoCancelacion || null,

      fechaLimiteCancelacion:
        parsedCancellationDate,

      totalPagado:
        parsedTotal,

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

          <h2>
            {compraProveedor
              ? "Editar confirmación del operador"
              : "Registrar confirmación del operador"}
          </h2>
        </div>

        <button
          aria-label="Cerrar"
          className="icon-button"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          ×
        </button>
      </div>

      <section className="confirmacion-admin-service-summary">
        <div className="confirmacion-admin-service-main">
          <span>Servicio seleccionado</span>

          <strong>
            {row.servicioIncluido}
          </strong>

          <small>
            {formatServiceDate(
              row.fecha,
              row.fechaFin
            )}
          </small>
        </div>

        <div className="confirmacion-admin-summary-item">
          <span>Operador</span>
          <strong>{operador}</strong>
        </div>

        <div className="confirmacion-admin-summary-item">
          <span>Código actual</span>

          <strong>
            {compraProveedor
              ?.codigoConfirmacionProveedor ||
              "Sin confirmar"}
          </strong>
        </div>

        {compraProveedor ? (
          <div className="confirmacion-admin-summary-item">
            <span>Código interno</span>

            <strong>
              {compraProveedor.codigoInterno}
            </strong>
          </div>
        ) : null}
      </section>

      <section className="confirmacion-admin-service-prices">
        <h3>
          Precios registrados en la confirmación
        </h3>

        <div className="confirmacion-admin-price-list">
          {columns.map((column) => {
            const price = row.precios.find(
              (item) =>
                item.columnId === column.id
            );

            const value =
              price?.precioConfirmado ??
              price?.precioCotizado;

            return (
              <div
                className="confirmacion-admin-price-item"
                key={column.id}
              >
                <span>
                  {getColumnLabel(column)}
                </span>

                <strong>
                  {formatMoney(
                    value,
                    monedaCodigo
                  )}
                </strong>

                <small>
                  Multiplicador:{" "}
                  {Math.max(
                    Number(
                      column.multiplicador ?? 1
                    ),
                    1
                  )}
                </small>
              </div>
            );
          })}
        </div>
      </section>

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

            <option value="PAGAR_DESPUES">
              Pagar después
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
            inputMode="numeric"
            maxLength={10}
            onChange={(event) =>
              setFechaConfirmacion(
                normalizeDateInput(
                  event.target.value
                )
              )
            }
            placeholder="dd/mm/yyyy"
            value={fechaConfirmacion}
          />

          {compraProveedor?.fechaConfirmacion ? (
            <small>
              Guardada:{" "}
              {formatAdministrativeDate(
                compraProveedor
                  .fechaConfirmacion
              )}
            </small>
          ) : null}
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
          <label>
            <span>
              Cancelación gratuita hasta
            </span>

            <input
              disabled={isSaving}
              inputMode="numeric"
              maxLength={10}
              onChange={(event) =>
                setFechaLimiteCancelacion(
                  normalizeDateInput(
                    event.target.value
                  )
                )
              }
              placeholder="dd/mm/yyyy"
              value={fechaLimiteCancelacion}
            />

            {compraProveedor
              ?.fechaLimiteCancelacion ? (
              <small>
                Guardada:{" "}
                {formatAdministrativeDate(
                  compraProveedor
                    .fechaLimiteCancelacion
                )}
              </small>
            ) : null}
          </label>
        ) : null}

        <div className="confirmacion-admin-auto-column">
          <span>Aplicación automática</span>

          {automaticColumn ? (
            <>
              <strong>
                {getColumnLabel(automaticColumn)}
              </strong>

              <small>
                El precio pagado se dividirá entre{" "}
                {Math.max(
                  Number(
                    automaticColumn.multiplicador ?? 1
                  ),
                  1
                )}
                .
              </small>
            </>
          ) : (
            <small>
              No se encontró una columna con precio para este servicio.
            </small>
          )}
        </div>

        <label>
          <span>Precio total pagado</span>

          <input
            disabled={isSaving}
            min="0"
            onChange={(event) =>
              setTotalPagado(
                event.target.value
              )
            }
            placeholder="0.00"
            step="0.01"
            type="number"
            value={totalPagado}
          />

          {dividedPaidValue !== null ? (
            <small>
              Valor dividido:{" "}
              {formatMoney(
                dividedPaidValue,
                purchaseCurrency
              )}
            </small>
          ) : null}
        </label>

        <label>
          <span>Moneda</span>

          <input
            disabled={isSaving}
            maxLength={3}
            minLength={3}
            onChange={(event) =>
              setPurchaseCurrency(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 3)
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
            purchaseCurrency.trim().length !== 3 ||
            !automaticColumn
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