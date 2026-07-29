/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/ConfirmacionAdministrativePanel.tsx */

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";

import type {
  CompraProveedor,
  CompraProveedorCancelValues,
  CompraProveedorCancelacionTipo,
  CompraProveedorCreateValues,
  CompraProveedorEstadoEditable,
  CompraProveedorReplaceValues,
  CompraProveedorUpdateValues
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

export type LegacyConfirmacionPurchase = {
  id: number;
  codigoInterno: string;
  codigoConfirmacionProveedor: string | null;
  estado: string;
  fechaConfirmacion: string | null;
  tipoCancelacion: CompraProveedorCancelacionTipo | null;
  fechaLimiteCancelacion: string | null;
  columnaSeleccionada: {
    id: number;
    multiplicador: number;
  } | null;
  totalPagado: number | null;
  valorPagadoUnidad: number | null;
  precioCotizadoComparacion: number | null;
  resultadoComparacion: "MENOR_IGUAL" | "MAYOR" | null;
  monedaCodigo: string;
  notaAdministrativa: string;
};

export type ConfirmacionAdministrativePurchase =
  | CompraProveedor
  | LegacyConfirmacionPurchase;

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
  compraProveedor?: ConfirmacionAdministrativePurchase | null;
  monedaCodigo: string;
  columns: ConfirmacionAdministrativeColumn[];
  row: ConfirmacionAdministrativeRow;
  isSaving?: boolean;
  onClose: () => void;
  onCreate: (values: CompraProveedorCreateValues) => Promise<void>;
  onUpdate: (
    proveedorReservaId: number,
    values: CompraProveedorUpdateValues
  ) => Promise<void>;
  onCancelReservation: (
    proveedorReservaId: number,
    values: CompraProveedorCancelValues
  ) => Promise<void>;
  onReplace: (
    proveedorReservaId: number,
    values: CompraProveedorReplaceValues
  ) => Promise<void>;
};

type PanelMode =
  | "FORM"
  | "CANCEL"
  | "REPLACE"
  | "HISTORY";

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

function isNewPurchase(
  value:
    | ConfirmacionAdministrativePurchase
    | null
    | undefined
): value is CompraProveedor {
  return Boolean(
    value &&
      "estadoOperativo" in value &&
      "codigoProveedor" in value
  );
}

function todayIsoDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

function normalizeDateInput(value: string) {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
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

  const monthLabel =
    MONTH_LABELS[Number(match[2]) - 1] ?? "";

  return `${match[3]}/${monthLabel}(${match[2]})/${match[1]}`;
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

function getOperationalStatusLabel(
  value: string
) {
  const labels: Record<string, string> = {
    BORRADOR: "Borrador",
    SOLICITADA: "Solicitada",
    CONFIRMADA: "Confirmada",
    CANCELADA: "Cancelada",
    REEMPLAZADA: "Reemplazada",
    REALIZADA: "Realizada"
  };

  return labels[value] ?? value;
}

function getFinancialStatusLabel(
  value: string
) {
  const labels: Record<string, string> = {
    SIN_PAGAR: "Sin pagar",
    PAGO_PROGRAMADO: "Pago programado",
    PAGO_PARCIAL: "Pago parcial",
    PAGADO: "Pagado",
    FALTA_COP: "Falta COP",
    REEMBOLSADO: "Reembolsado"
  };

  return labels[value] ?? value;
}

export function ConfirmacionAdministrativePanel({
  operador,
  compraProveedor,
  monedaCodigo,
  columns,
  row,
  isSaving = false,
  onClose,
  onCreate,
  onUpdate,
  onCancelReservation,
  onReplace
}: ConfirmacionAdministrativePanelProps) {
  const newPurchase = isNewPurchase(
    compraProveedor
  )
    ? compraProveedor
    : null;

  const legacyPurchase =
    !newPurchase &&
    compraProveedor &&
    "codigoConfirmacionProveedor" in compraProveedor
      ? compraProveedor
      : null;

  const isLegacy =
    Boolean(legacyPurchase);

  const [mode, setMode] =
    useState<PanelMode>("FORM");

  const [estadoOperativo, setEstadoOperativo] =
    useState<CompraProveedorEstadoEditable>(
      newPurchase?.estadoOperativo === "REALIZADA"
        ? "REALIZADA"
        : newPurchase?.estadoOperativo === "SOLICITADA"
          ? "SOLICITADA"
          : newPurchase?.estadoOperativo === "CONFIRMADA"
            ? "CONFIRMADA"
            : "BORRADOR"
    );

  const [codigoProveedor, setCodigoProveedor] =
    useState(
      newPurchase?.codigoProveedor ??
        (legacyPurchase
          ?.codigoConfirmacionProveedor ?? "")
    );

  const [fechaReserva, setFechaReserva] =
    useState(
      isoToDisplayInput(
        newPurchase?.fechaReserva ??
          todayIsoDate()
      )
    );

  const [fechaConfirmacion, setFechaConfirmacion] =
    useState(
      isoToDisplayInput(
        newPurchase?.fechaConfirmacion ??
          legacyPurchase
            ?.fechaConfirmacion
      )
    );

  const [fechaPrevistaCobro, setFechaPrevistaCobro] =
    useState(
      isoToDisplayInput(
        newPurchase?.fechaPrevistaCobro
      )
    );

  const [tipoCancelacion, setTipoCancelacion] =
    useState<
      CompraProveedorCancelacionTipo | ""
    >(
      newPurchase?.tipoCancelacion ??
        compraProveedor?.tipoCancelacion ??
        ""
    );

  const [
    fechaLimiteCancelacion,
    setFechaLimiteCancelacion
  ] = useState(
    isoToDisplayInput(
      newPurchase?.fechaLimiteCancelacion ??
        compraProveedor?.fechaLimiteCancelacion
    )
  );

  const [valorContratado, setValorContratado] =
    useState(
      newPurchase?.valorContratado === null ||
        newPurchase?.valorContratado === undefined
        ? legacyPurchase?.totalPagado !== null &&
          legacyPurchase?.totalPagado !== undefined
          ? String(legacyPurchase.totalPagado)
          : ""
        : String(newPurchase.valorContratado)
    );

  const [purchaseCurrency, setPurchaseCurrency] =
    useState(
      compraProveedor?.monedaCodigo ??
        monedaCodigo
    );

  const [notaAdministrativa, setNotaAdministrativa] =
    useState(
      compraProveedor?.notaAdministrativa ?? ""
    );

  const [motivoCancelacion, setMotivoCancelacion] =
    useState("");

  const [fechaCancelacion, setFechaCancelacion] =
    useState(
      isoToDisplayInput(todayIsoDate())
    );

  const [motivoReemplazo, setMotivoReemplazo] =
    useState("");

  useEffect(() => {
    setMode("FORM");
    setEstadoOperativo(
      newPurchase?.estadoOperativo === "REALIZADA"
        ? "REALIZADA"
        : newPurchase?.estadoOperativo === "SOLICITADA"
          ? "SOLICITADA"
          : newPurchase?.estadoOperativo === "CONFIRMADA"
            ? "CONFIRMADA"
            : "BORRADOR"
    );
    setCodigoProveedor(
      newPurchase?.codigoProveedor ??
        (legacyPurchase
          ?.codigoConfirmacionProveedor ?? "")
    );
    setFechaReserva(
      isoToDisplayInput(
        newPurchase?.fechaReserva ??
          todayIsoDate()
      )
    );
    setFechaConfirmacion(
      isoToDisplayInput(
        newPurchase?.fechaConfirmacion ??
          legacyPurchase
            ?.fechaConfirmacion
      )
    );
    setFechaPrevistaCobro(
      isoToDisplayInput(
        newPurchase?.fechaPrevistaCobro
      )
    );
    setTipoCancelacion(
      newPurchase?.tipoCancelacion ??
        compraProveedor?.tipoCancelacion ??
        ""
    );
    setFechaLimiteCancelacion(
      isoToDisplayInput(
        newPurchase?.fechaLimiteCancelacion ??
          compraProveedor?.fechaLimiteCancelacion
      )
    );
    setValorContratado(
      newPurchase?.valorContratado === null ||
        newPurchase?.valorContratado === undefined
        ? legacyPurchase?.totalPagado !== null &&
          legacyPurchase?.totalPagado !== undefined
          ? String(legacyPurchase.totalPagado)
          : ""
        : String(newPurchase.valorContratado)
    );
    setPurchaseCurrency(
      compraProveedor?.monedaCodigo ??
        monedaCodigo
    );
    setNotaAdministrativa(
      compraProveedor?.notaAdministrativa ?? ""
    );
    setMotivoCancelacion("");
    setMotivoReemplazo("");
  }, [
    compraProveedor,
    legacyPurchase,
    monedaCodigo,
    newPurchase
  ]);

  const automaticColumn = useMemo(() => {
    if (compraProveedor?.columnaSeleccionada) {
      return (
        columns.find(
          (column) =>
            column.id ===
            compraProveedor
              .columnaSeleccionada?.id
        ) ?? null
      );
    }

    return (
      columns.find((column) => {
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
      }) ?? null
    );
  }, [
    columns,
    compraProveedor?.columnaSeleccionada,
    row.precios
  ]);

  const contractedUnitValue = useMemo(() => {
    if (
      !automaticColumn ||
      !valorContratado.trim()
    ) {
      return null;
    }

    const parsedValue =
      Number(valorContratado);

    if (!Number.isFinite(parsedValue)) {
      return null;
    }

    return (
      parsedValue /
      Math.max(
        Number(
          automaticColumn.multiplicador ?? 1
        ),
        1
      )
    );
  }, [
    automaticColumn,
    valorContratado
  ]);

  const showCancellationDeadline =
    tipoCancelacion ===
    "GRATUITA_HASTA";

  const statusHelp = useMemo(() => {
    if (estadoOperativo === "BORRADOR") {
      return "Registro preliminar. Todavía no se ha solicitado al proveedor.";
    }

    if (estadoOperativo === "SOLICITADA") {
      return "La reserva fue solicitada y está pendiente de respuesta.";
    }

    if (estadoOperativo === "CONFIRMADA") {
      return "El proveedor confirmó la prestación del servicio.";
    }

    return "El servicio fue marcado como realizado.";
  }, [estadoOperativo]);

  function parseFormValues() {
    const parsedReservationDate =
      displayInputToIso(fechaReserva);

    const parsedConfirmationDate =
      displayInputToIso(fechaConfirmacion);

    const parsedPlannedChargeDate =
      displayInputToIso(fechaPrevistaCobro);

    const parsedCancellationDeadline =
      showCancellationDeadline
        ? displayInputToIso(
            fechaLimiteCancelacion
          )
        : null;

    const parsedValue =
      valorContratado.trim()
        ? Number(valorContratado)
        : null;

    if (!parsedReservationDate) {
      window.alert(
        "La fecha de reserva debe tener formato dd/mm/yyyy."
      );
      return null;
    }

    if (
      fechaConfirmacion.trim() &&
      !parsedConfirmationDate
    ) {
      window.alert(
        "La fecha de confirmación debe tener formato dd/mm/yyyy."
      );
      return null;
    }

    if (
      fechaPrevistaCobro.trim() &&
      !parsedPlannedChargeDate
    ) {
      window.alert(
        "La fecha prevista de cobro debe tener formato dd/mm/yyyy."
      );
      return null;
    }

    if (
      showCancellationDeadline &&
      fechaLimiteCancelacion.trim() &&
      !parsedCancellationDeadline
    ) {
      window.alert(
        "La fecha máxima de cancelación debe tener formato dd/mm/yyyy."
      );
      return null;
    }

    if (
      parsedValue !== null &&
      (
        !Number.isFinite(parsedValue) ||
        parsedValue < 0
      )
    ) {
      window.alert(
        "El valor contratado debe ser un número válido."
      );
      return null;
    }

    if (
      purchaseCurrency.trim().length !== 3
    ) {
      window.alert(
        "La moneda debe tener tres letras."
      );
      return null;
    }

    return {
      estadoOperativo,
      codigoProveedor:
        codigoProveedor.trim() || null,
      fechaReserva:
        parsedReservationDate,
      fechaConfirmacion:
        parsedConfirmationDate,
      fechaPrevistaCobro:
        parsedPlannedChargeDate,
      tipoCancelacion:
        tipoCancelacion || null,
      fechaLimiteCancelacion:
        parsedCancellationDeadline,
      valorContratado:
        parsedValue,
      monedaCodigo:
        purchaseCurrency
          .trim()
          .toUpperCase(),
      notaAdministrativa:
        notaAdministrativa.trim() || null
    } satisfies CompraProveedorCreateValues;
  }

  async function submitForm(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isLegacy) {
      window.alert(
        "Este registro pertenece al sistema anterior. Debe migrarse antes de editarlo desde Compras a proveedores."
      );
      return;
    }

    const values = parseFormValues();

    if (!values) {
      return;
    }

    if (newPurchase) {
      await onUpdate(
        newPurchase.id,
        values
      );
    } else {
      await onCreate(values);
    }
  }

  async function submitCancellation() {
    if (!newPurchase) {
      return;
    }

    const parsedDate =
      displayInputToIso(fechaCancelacion);

    if (!parsedDate) {
      window.alert(
        "La fecha de cancelación debe tener formato dd/mm/yyyy."
      );
      return;
    }

    if (!motivoCancelacion.trim()) {
      window.alert(
        "Debes indicar el motivo de la cancelación."
      );
      return;
    }

    await onCancelReservation(
      newPurchase.id,
      {
        fechaCancelacion: parsedDate,
        motivoCancelacion:
          motivoCancelacion.trim()
      }
    );
  }

  async function submitReplacement() {
    if (!newPurchase) {
      return;
    }

    const values = parseFormValues();

    if (!values) {
      return;
    }

    if (!codigoProveedor.trim()) {
      window.alert(
        "La nueva reserva debe tener código de proveedor."
      );
      return;
    }

    if (!motivoReemplazo.trim()) {
      window.alert(
        "Debes indicar el motivo del reemplazo."
      );
      return;
    }

    const replacementStatus =
      values.estadoOperativo === "SOLICITADA"
        ? "SOLICITADA"
        : "CONFIRMADA";

    await onReplace(
      newPurchase.id,
      {
        codigoProveedor:
          codigoProveedor.trim(),
        motivoReemplazo:
          motivoReemplazo.trim(),
        estadoOperativo:
          replacementStatus,
        fechaReserva:
          values.fechaReserva,
        fechaConfirmacion:
          values.fechaConfirmacion,
        fechaPrevistaCobro:
          values.fechaPrevistaCobro,
        tipoCancelacion:
          values.tipoCancelacion,
        fechaLimiteCancelacion:
          values.fechaLimiteCancelacion,
        valorContratado:
          values.valorContratado,
        monedaCodigo:
          values.monedaCodigo,
        notaAdministrativa:
          values.notaAdministrativa
      }
    );
  }

  const currentCode = newPurchase
    ? newPurchase.codigoProveedor
    : legacyPurchase
      ?.codigoConfirmacionProveedor ?? null;

  return (
    <form
      className="confirmacion-admin-panel"
      onSubmit={submitForm}
    >
      <div className="confirmacion-admin-heading">
        <div>
          <p className="eyebrow">
            Conexión con Contabilidad
          </p>

          <h2>
            {newPurchase
              ? "Reserva vigente del proveedor"
              : isLegacy
                ? "Registro administrativo anterior"
                : "Crear reserva del proveedor"}
          </h2>

          <p>
            La confirmación muestra el servicio. La compra,
            sus estados y su historial se administran en el
            módulo independiente de Contabilidad.
          </p>
        </div>

        <button
          aria-label="Cerrar"
          className="icon-button"
          disabled={isSaving}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>

      {isLegacy ? (
        <div className="confirmacion-admin-legacy-warning">
          Este movimiento fue creado con el sistema anterior.
          Se conserva en modo lectura hasta realizar la migración.
        </div>
      ) : null}

      <section className="confirmacion-admin-service-summary">
        <div className="confirmacion-admin-service-main">
          <span>Servicio confirmado</span>
          <strong>{row.servicioIncluido}</strong>
          <small>
            {formatServiceDate(
              row.fecha,
              row.fechaFin
            )}
          </small>
        </div>

        <div className="confirmacion-admin-summary-item">
          <span>Proveedor</span>
          <strong>{operador}</strong>
        </div>

        <div className="confirmacion-admin-summary-item">
          <span>Código vigente</span>
          <strong>
            {currentCode || "Sin código"}
          </strong>
        </div>

        <div className="confirmacion-admin-summary-item">
          <span>Historial</span>
          <strong>
            {newPurchase
              ? `${newPurchase.historialCantidad} registro(s)`
              : isLegacy
                ? "Sistema anterior"
                : "Sin movimientos"}
          </strong>
        </div>
      </section>

      {newPurchase ? (
        <section className="confirmacion-accounting-status-strip">
          <div>
            <span>Estado operativo</span>
            <strong>
              {getOperationalStatusLabel(
                newPurchase.estadoOperativo
              )}
            </strong>
          </div>

          <div>
            <span>Estado financiero</span>
            <strong>
              {getFinancialStatusLabel(
                newPurchase.estadoFinanciero
              )}
            </strong>
          </div>

          <div>
            <span>Código interno</span>
            <strong>
              {newPurchase.codigoInterno}
            </strong>
          </div>
        </section>
      ) : null}

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

      {mode === "HISTORY" && newPurchase ? (
        <section className="confirmacion-admin-history">
          <div className="confirmacion-admin-section-heading">
            <div>
              <h3>Historial de reservas</h3>
              <p>
                Las reservas reemplazadas o canceladas se
                conservan y nunca pisan el código anterior.
              </p>
            </div>

            <button
              className="link-button"
              onClick={() => setMode("FORM")}
              type="button"
            >
              Volver al formulario
            </button>
          </div>

          <div className="confirmacion-admin-history-list">
            {newPurchase.historial.map(
              (historyItem) => (
                <article
                  className={
                    historyItem.esVigente
                      ? "confirmacion-admin-history-item confirmacion-admin-history-item-active"
                      : "confirmacion-admin-history-item"
                  }
                  key={historyItem.id}
                >
                  <div>
                    <span>Código proveedor</span>
                    <strong>
                      {historyItem.codigoProveedor ||
                        "Sin código"}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {getOperationalStatusLabel(
                        historyItem.estadoOperativo
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Fecha reserva</span>
                    <strong>
                      {formatAdministrativeDate(
                        historyItem.fechaReserva
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Motivo</span>
                    <strong>
                      {historyItem.motivoCancelacion ||
                        "Sin observación"}
                    </strong>
                  </div>
                </article>
              )
            )}
          </div>
        </section>
      ) : mode === "CANCEL" && newPurchase ? (
        <section className="confirmacion-admin-operation-box confirmacion-admin-operation-danger">
          <div className="confirmacion-admin-section-heading">
            <div>
              <h3>Cancelar reserva vigente</h3>
              <p>
                La reserva seguirá visible en el historial y
                dejará de ser la reserva activa.
              </p>
            </div>
          </div>

          <div className="confirmacion-admin-operation-grid">
            <label>
              <span>Fecha de cancelación</span>
              <input
                disabled={isSaving}
                inputMode="numeric"
                maxLength={10}
                onChange={(event) =>
                  setFechaCancelacion(
                    normalizeDateInput(
                      event.target.value
                    )
                  )
                }
                placeholder="dd/mm/yyyy"
                value={fechaCancelacion}
              />
            </label>

            <label className="confirmacion-admin-notes">
              <span>Motivo de cancelación</span>
              <textarea
                disabled={isSaving}
                onChange={(event) =>
                  setMotivoCancelacion(
                    event.target.value
                  )
                }
                placeholder="Ej: El proveedor no confirmó disponibilidad."
                value={motivoCancelacion}
              />
            </label>
          </div>

          <div className="confirmacion-admin-actions">
            <button
              className="link-button"
              disabled={isSaving}
              onClick={() => setMode("FORM")}
              type="button"
            >
              Volver
            </button>

            <button
              className="danger-button"
              disabled={isSaving}
              onClick={submitCancellation}
              type="button"
            >
              {isSaving
                ? "Cancelando..."
                : "Confirmar cancelación"}
            </button>
          </div>
        </section>
      ) : (
        <>
          {mode === "REPLACE" ? (
            <div className="confirmacion-admin-replace-notice">
              Se creará una reserva nueva y la actual quedará
              marcada como reemplazada. El código anterior se
              conservará en el historial.
            </div>
          ) : null}

          <div className="confirmacion-admin-grid">
            <label>
              <span>Estado operativo</span>

              <select
                disabled={isSaving || isLegacy}
                onChange={(event) =>
                  setEstadoOperativo(
                    event.target
                      .value as CompraProveedorEstadoEditable
                  )
                }
                value={estadoOperativo}
              >
                <option value="BORRADOR">
                  Borrador
                </option>
                <option value="SOLICITADA">
                  Solicitada
                </option>
                <option value="CONFIRMADA">
                  Confirmada
                </option>
                <option value="REALIZADA">
                  Realizada
                </option>
              </select>

              <small>{statusHelp}</small>
            </label>

            <label>
              <span>Código del proveedor</span>

              <input
                disabled={isSaving || isLegacy}
                maxLength={120}
                onChange={(event) =>
                  setCodigoProveedor(
                    event.target.value
                  )
                }
                placeholder="Ej: A121599"
                value={codigoProveedor}
              />
            </label>

            <label>
              <span>Fecha de reserva</span>

              <input
                disabled={isSaving || isLegacy}
                inputMode="numeric"
                maxLength={10}
                onChange={(event) =>
                  setFechaReserva(
                    normalizeDateInput(
                      event.target.value
                    )
                  )
                }
                placeholder="dd/mm/yyyy"
                value={fechaReserva}
              />
            </label>

            <label>
              <span>Fecha de confirmación</span>

              <input
                disabled={isSaving || isLegacy}
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
            </label>

            <label>
              <span>Fecha prevista de cobro</span>

              <input
                disabled={isSaving || isLegacy}
                inputMode="numeric"
                maxLength={10}
                onChange={(event) =>
                  setFechaPrevistaCobro(
                    normalizeDateInput(
                      event.target.value
                    )
                  )
                }
                placeholder="dd/mm/yyyy"
                value={fechaPrevistaCobro}
              />

              <small>
                Esta fecha programa el pago, pero no registra
                un pago real.
              </small>
            </label>

            <label>
              <span>Política de cancelación</span>

              <select
                disabled={isSaving || isLegacy}
                onChange={(event) =>
                  setTipoCancelacion(
                    event.target.value as
                      | CompraProveedorCancelacionTipo
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
                  disabled={isSaving || isLegacy}
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
              </label>
            ) : null}

            <div className="confirmacion-admin-auto-column">
              <span>Columna aplicada</span>

              {automaticColumn ? (
                <>
                  <strong>
                    {getColumnLabel(
                      automaticColumn
                    )}
                  </strong>
                  <small>
                    Multiplicador:{" "}
                    {Math.max(
                      Number(
                        automaticColumn
                          .multiplicador ?? 1
                      ),
                      1
                    )}
                  </small>
                </>
              ) : (
                <small>
                  No se encontró una columna con precio.
                </small>
              )}
            </div>

            <label>
              <span>Valor total contratado</span>

              <input
                disabled={isSaving || isLegacy}
                min="0"
                onChange={(event) =>
                  setValorContratado(
                    event.target.value
                  )
                }
                placeholder="0.00"
                step="0.01"
                type="number"
                value={valorContratado}
              />

              {contractedUnitValue !== null ? (
                <small>
                  Valor por unidad:{" "}
                  {formatMoney(
                    contractedUnitValue,
                    purchaseCurrency
                  )}
                </small>
              ) : null}
            </label>

            <label>
              <span>Moneda</span>

              <input
                disabled={isSaving || isLegacy}
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

            {mode === "REPLACE" ? (
              <label className="confirmacion-admin-notes">
                <span>Motivo del reemplazo</span>

                <textarea
                  disabled={isSaving}
                  onChange={(event) =>
                    setMotivoReemplazo(
                      event.target.value
                    )
                  }
                  placeholder="Ej: El proveedor emitió un nuevo código o se cambió de operador."
                  value={motivoReemplazo}
                />
              </label>
            ) : null}

            <label className="confirmacion-admin-notes">
              <span>Notas administrativas</span>

              <textarea
                disabled={isSaving || isLegacy}
                onChange={(event) =>
                  setNotaAdministrativa(
                    event.target.value
                  )
                }
                placeholder="Condiciones, contacto del proveedor y observaciones..."
                value={notaAdministrativa}
              />
            </label>
          </div>

          <div className="confirmacion-admin-actions confirmacion-admin-actions-spread">
            <div className="confirmacion-admin-secondary-actions">
              {newPurchase && mode === "FORM" ? (
                <>
                  <button
                    className="link-button"
                    disabled={isSaving}
                    onClick={() =>
                      setMode("HISTORY")
                    }
                    type="button"
                  >
                    Ver historial
                  </button>

                  <button
                    className="link-button"
                    disabled={isSaving}
                    onClick={() =>
                      setMode("REPLACE")
                    }
                    type="button"
                  >
                    Reemplazar reserva
                  </button>

                  <button
                    className="danger-link-button"
                    disabled={isSaving}
                    onClick={() =>
                      setMode("CANCEL")
                    }
                    type="button"
                  >
                    Cancelar reserva
                  </button>
                </>
              ) : mode === "REPLACE" ? (
                <button
                  className="link-button"
                  disabled={isSaving}
                  onClick={() => {
                    setMode("FORM");
                    setMotivoReemplazo("");
                  }}
                  type="button"
                >
                  Volver
                </button>
              ) : null}
            </div>

            <div className="confirmacion-admin-primary-actions">
              <button
                className="link-button"
                disabled={isSaving}
                onClick={onClose}
                type="button"
              >
                Cerrar
              </button>

              {!isLegacy ? (
                <button
                  className="primary-button"
                  disabled={
                    isSaving ||
                    !automaticColumn ||
                    purchaseCurrency
                      .trim().length !== 3
                  }
                  onClick={
                    mode === "REPLACE"
                      ? submitReplacement
                      : undefined
                  }
                  type={
                    mode === "REPLACE"
                      ? "button"
                      : "submit"
                  }
                >
                  {isSaving
                    ? "Guardando..."
                    : mode === "REPLACE"
                      ? "Crear reemplazo"
                      : newPurchase
                        ? "Guardar cambios"
                        : "Crear reserva"}
                </button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </form>
  );
}