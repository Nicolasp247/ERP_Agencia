/* erp-tour-operator/frontend/src/pages/expediente/confirmacion-builder/components/accounting/ConfirmacionPaymentSummary.tsx */

import type {
  CompraProveedor
} from "@/modules/contabilidad/compras-proveedor/compras-proveedor-api";

type ConfirmacionPaymentSummaryProps = {
  compra: CompraProveedor;
};

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

function getFinancialStatusLabel(
  value: CompraProveedor["estadoFinanciero"]
) {
  const labels: Record<
    CompraProveedor["estadoFinanciero"],
    string
  > = {
    SIN_PAGAR: "Sin pagar",
    PAGO_PROGRAMADO: "Pago programado",
    PAGO_PARCIAL: "Pago parcial",
    PAGADO: "Pagado",
    FALTA_COP: "Falta COP",
    REEMBOLSADO: "Reembolsado"
  };

  return labels[value];
}

export function ConfirmacionPaymentSummary({
  compra
}: ConfirmacionPaymentSummaryProps) {
  return (
    <section className="confirmacion-payment-summary">
      <div>
        <span>Valor contratado</span>
        <strong>
          {formatMoney(
            compra.valorContratado,
            compra.monedaCodigo
          )}
        </strong>
      </div>

      <div>
        <span>Total pagado</span>
        <strong>
          {formatMoney(
            compra.totalPagado ?? 0,
            compra.monedaCodigo
          )}
        </strong>
      </div>

      <div>
        <span>Total reembolsado</span>
        <strong>
          {formatMoney(
            compra.totalReembolsado ?? 0,
            compra.monedaCodigo
          )}
        </strong>
      </div>

      <div>
        <span>Saldo pendiente</span>
        <strong>
          {formatMoney(
            compra.saldoPendiente,
            compra.monedaCodigo
          )}
        </strong>
      </div>

      <div>
        <span>Estado financiero</span>
        <strong>
          {getFinancialStatusLabel(
            compra.estadoFinanciero
          )}
        </strong>
      </div>
    </section>
  );
}