/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/accounting/ConfirmacionPaymentsList.tsx */

import type {
  CompraProveedorPago
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

type ConfirmacionPaymentsListProps = {
  payments: CompraProveedorPago[];
  isSaving?: boolean;
  onEdit: (payment: CompraProveedorPago) => void;
  onVoid: (payment: CompraProveedorPago) => void;
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

function formatDate(
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

function getTypeLabel(
  value: CompraProveedorPago["tipo"]
) {
  const labels: Record<
    CompraProveedorPago["tipo"],
    string
  > = {
    PAGO: "Pago",
    REEMBOLSO: "Reembolso",
    AJUSTE: "Ajuste"
  };

  return labels[value];
}

export function ConfirmacionPaymentsList({
  payments,
  isSaving = false,
  onEdit,
  onVoid
}: ConfirmacionPaymentsListProps) {
  if (!payments.length) {
    return (
      <div className="services-empty-state">
        Todavía no hay movimientos financieros.
      </div>
    );
  }

  return (
    <div className="confirmacion-payment-list">
      {payments.map((payment) => {
        const isVoided =
          payment.estado === "ANULADO";

        return (
          <article
            className={
              isVoided
                ? "confirmacion-payment-item confirmacion-payment-item-void"
                : "confirmacion-payment-item"
            }
            key={payment.id}
          >
            <div>
              <span>Tipo</span>
              <strong>
                {getTypeLabel(payment.tipo)}
              </strong>
            </div>

            <div>
              <span>Fecha</span>
              <strong>
                {formatDate(payment.fechaCargo)}
              </strong>
            </div>

            <div>
              <span>Valor original</span>
              <strong>
                {formatMoney(
                  payment.valorMonedaOriginal,
                  payment.monedaOriginal
                )}
              </strong>
            </div>

            <div>
              <span>Valor COP</span>
              <strong>
                {formatMoney(
                  payment.valorCop,
                  "COP"
                )}
              </strong>
            </div>

            <div>
              <span>Método</span>
              <strong>
                {payment.metodoPago ||
                  "Sin definir"}
              </strong>
            </div>

            <div>
              <span>Referencia</span>
              <strong>
                {payment.referenciaPago ||
                  "Sin referencia"}
              </strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>
                {payment.estado === "REGISTRADO"
                  ? "Registrado"
                  : "Anulado"}
              </strong>
            </div>

            <div className="confirmacion-payment-item-actions">
              <button
                className="link-button"
                disabled={
                  isSaving ||
                  isVoided
                }
                onClick={() =>
                  onEdit(payment)
                }
                type="button"
              >
                Editar
              </button>

              <button
                className="danger-link-button"
                disabled={
                  isSaving ||
                  isVoided
                }
                onClick={() =>
                  onVoid(payment)
                }
                type="button"
              >
                Anular
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}