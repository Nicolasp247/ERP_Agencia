/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/accounting/ConfirmacionPaymentForm.tsx */

import {
  useEffect,
  useState,
  type FormEvent
} from "react";

import type {
  CompraProveedorPago,
  CompraProveedorPagoCreateValues,
  CompraProveedorPagoUpdateValues,
  CompraProveedorReembolsoCreateValues
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

type PaymentFormMode =
  | "PAYMENT"
  | "REFUND"
  | "EDIT";

type ConfirmacionPaymentFormProps = {
  mode: PaymentFormMode;
  defaultCurrency: string;
  payment?: CompraProveedorPago | null;
  isSaving?: boolean;
  onCancel: () => void;
  onCreatePayment: (
    values: CompraProveedorPagoCreateValues
  ) => Promise<void>;
  onCreateRefund: (
    values: CompraProveedorReembolsoCreateValues
  ) => Promise<void>;
  onUpdatePayment: (
    pagoId: number,
    values: CompraProveedorPagoUpdateValues
  ) => Promise<void>;
};

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
  const match = value
    .trim()
    .match(
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

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
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

export function ConfirmacionPaymentForm({
  mode,
  defaultCurrency,
  payment = null,
  isSaving = false,
  onCancel,
  onCreatePayment,
  onCreateRefund,
  onUpdatePayment
}: ConfirmacionPaymentFormProps) {
  const [fechaCargo, setFechaCargo] =
    useState(
      isoToDisplayInput(
        payment?.fechaCargo ??
          todayIsoDate()
      )
    );

  const [
    valorMonedaOriginal,
    setValorMonedaOriginal
  ] = useState(
    payment?.valorMonedaOriginal === null ||
      payment?.valorMonedaOriginal === undefined
      ? ""
      : String(
          payment.valorMonedaOriginal
        )
  );

  const [monedaOriginal, setMonedaOriginal] =
    useState(
      payment?.monedaOriginal ??
        defaultCurrency
    );

  const [valorCop, setValorCop] =
    useState(
      payment?.valorCop === null ||
        payment?.valorCop === undefined
        ? ""
        : String(payment.valorCop)
    );

  const [tasaCambio, setTasaCambio] =
    useState(
      payment?.tasaCambio === null ||
        payment?.tasaCambio === undefined
        ? ""
        : String(payment.tasaCambio)
    );

  const [metodoPago, setMetodoPago] =
    useState(
      payment?.metodoPago ?? ""
    );

  const [
    referenciaPago,
    setReferenciaPago
  ] = useState(
    payment?.referenciaPago ?? ""
  );

  const [nota, setNota] =
    useState(
      payment?.nota ?? ""
    );

  useEffect(() => {
    setFechaCargo(
      isoToDisplayInput(
        payment?.fechaCargo ??
          todayIsoDate()
      )
    );

    setValorMonedaOriginal(
      payment?.valorMonedaOriginal === null ||
        payment?.valorMonedaOriginal === undefined
        ? ""
        : String(
            payment.valorMonedaOriginal
          )
    );

    setMonedaOriginal(
      payment?.monedaOriginal ??
        defaultCurrency
    );

    setValorCop(
      payment?.valorCop === null ||
        payment?.valorCop === undefined
        ? ""
        : String(payment.valorCop)
    );

    setTasaCambio(
      payment?.tasaCambio === null ||
        payment?.tasaCambio === undefined
        ? ""
        : String(payment.tasaCambio)
    );

    setMetodoPago(
      payment?.metodoPago ?? ""
    );

    setReferenciaPago(
      payment?.referenciaPago ?? ""
    );

    setNota(
      payment?.nota ?? ""
    );
  }, [
    defaultCurrency,
    payment
  ]);

  async function submitForm(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedDate =
      displayInputToIso(fechaCargo);

    const parsedOriginal =
      Number(valorMonedaOriginal);

    const parsedCop =
      valorCop.trim()
        ? Number(valorCop)
        : null;

    const parsedRate =
      tasaCambio.trim()
        ? Number(tasaCambio)
        : null;

    if (!parsedDate) {
      window.alert(
        "La fecha debe tener formato dd/mm/yyyy."
      );
      return;
    }

    if (
      !Number.isFinite(parsedOriginal) ||
      parsedOriginal <= 0
    ) {
      window.alert(
        "El valor original debe ser mayor que cero."
      );
      return;
    }

    if (
      parsedCop !== null &&
      (
        !Number.isFinite(parsedCop) ||
        parsedCop <= 0
      )
    ) {
      window.alert(
        "El valor COP debe ser mayor que cero."
      );
      return;
    }

    if (
      parsedRate !== null &&
      (
        !Number.isFinite(parsedRate) ||
        parsedRate <= 0
      )
    ) {
      window.alert(
        "La tasa de cambio debe ser mayor que cero."
      );
      return;
    }

    if (
      monedaOriginal.trim().length !== 3
    ) {
      window.alert(
        "La moneda debe tener tres letras."
      );
      return;
    }

    const values = {
      fechaCargo:
        parsedDate,
      valorMonedaOriginal:
        parsedOriginal,
      monedaOriginal:
        monedaOriginal
          .trim()
          .toUpperCase(),
      valorCop:
        parsedCop,
      tasaCambio:
        parsedRate,
      metodoPago:
        metodoPago.trim() || null,
      referenciaPago:
        referenciaPago.trim() || null,
      nota:
        nota.trim() || null
    };

    if (
      mode === "EDIT" &&
      payment
    ) {
      await onUpdatePayment(
        payment.id,
        values
      );
      return;
    }

    if (mode === "REFUND") {
      await onCreateRefund(values);
      return;
    }

    await onCreatePayment({
      ...values,
      tipo: "PAGO"
    });
  }

  const title =
    mode === "REFUND"
      ? "Registrar reembolso"
      : mode === "EDIT"
        ? "Editar movimiento"
        : "Registrar pago";

  return (
    <form
      className="confirmacion-admin-operation-box"
      onSubmit={submitForm}
    >
      <div className="confirmacion-admin-section-heading">
        <div>
          <h3>{title}</h3>

          <p>
            El valor original afecta el saldo. El valor COP
            permite controlar el costo real en moneda local.
          </p>
        </div>
      </div>

      <div className="confirmacion-payment-form-grid">
        <label>
          <span>Fecha</span>

          <input
            disabled={isSaving}
            inputMode="numeric"
            maxLength={10}
            onChange={(event) =>
              setFechaCargo(
                normalizeDateInput(
                  event.target.value
                )
              )
            }
            placeholder="dd/mm/yyyy"
            value={fechaCargo}
          />
        </label>

        <label>
          <span>Valor original</span>

          <input
            disabled={isSaving}
            min="0"
            onChange={(event) =>
              setValorMonedaOriginal(
                event.target.value
              )
            }
            step="0.01"
            type="number"
            value={valorMonedaOriginal}
          />
        </label>

        <label>
          <span>Moneda original</span>

          <input
            disabled={isSaving}
            maxLength={3}
            onChange={(event) =>
              setMonedaOriginal(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 3)
              )
            }
            value={monedaOriginal}
          />
        </label>

        <label>
          <span>Valor COP</span>

          <input
            disabled={isSaving}
            min="0"
            onChange={(event) =>
              setValorCop(
                event.target.value
              )
            }
            step="0.01"
            type="number"
            value={valorCop}
          />
        </label>

        <label>
          <span>Tasa de cambio</span>

          <input
            disabled={isSaving}
            min="0"
            onChange={(event) =>
              setTasaCambio(
                event.target.value
              )
            }
            step="0.0001"
            type="number"
            value={tasaCambio}
          />
        </label>

        <label>
          <span>Método de pago</span>

          <input
            disabled={isSaving}
            onChange={(event) =>
              setMetodoPago(
                event.target.value
              )
            }
            placeholder="Tarjeta, transferencia..."
            value={metodoPago}
          />
        </label>

        <label>
          <span>Referencia</span>

          <input
            disabled={isSaving}
            onChange={(event) =>
              setReferenciaPago(
                event.target.value
              )
            }
            placeholder="Número o código de transacción"
            value={referenciaPago}
          />
        </label>

        <label className="confirmacion-admin-notes">
          <span>Nota</span>

          <textarea
            disabled={isSaving}
            onChange={(event) =>
              setNota(
                event.target.value
              )
            }
            placeholder="Observaciones del movimiento..."
            value={nota}
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
          Volver
        </button>

        <button
          className="primary-button"
          disabled={isSaving}
          type="submit"
        >
          {isSaving
            ? "Guardando..."
            : title}
        </button>
      </div>
    </form>
  );
}