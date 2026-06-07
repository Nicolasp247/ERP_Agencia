/* erp-tour-operator/frontend/src/modules/expediente/expediente-labels.ts */

export function formatExpedienteEstado(value?: string | null) {
  const labels: Record<string, string> = {
    COTIZACION: "Cotización",
    CONFIRMACION: "Confirmación",
    DESCARTADO: "Descartado",
    YA_VIAJARON: "Ya viajaron"
  };

  return labels[value ?? ""] ?? value ?? "N/D";
}

export function formatVersionEstado(value?: string | null) {
  const labels: Record<string, string> = {
    BORRADOR: "Borrador",
    ENVIADA: "Enviada",
    ACEPTADA: "Aceptada",
    DESCARTADA: "Descartada",
    CONVERTIDA_CONFIRMACION: "Convertida en confirmación"
  };

  return labels[value ?? ""] ?? value ?? "N/D";
}

export function getExpedienteEstadoClass(value?: string | null) {
  if (value === "DESCARTADO") {
    return "status-chip-inactive";
  }

  if (value === "CONFIRMACION" || value === "YA_VIAJARON") {
    return "status-chip-active";
  }

  return "status-chip-neutral";
}

export function getVersionEstadoClass(value?: string | null) {
  if (value === "DESCARTADA") {
    return "status-chip-inactive";
  }

  if (value === "ACEPTADA" || value === "CONVERTIDA_CONFIRMACION") {
    return "status-chip-active";
  }

  return "status-chip-neutral";
}