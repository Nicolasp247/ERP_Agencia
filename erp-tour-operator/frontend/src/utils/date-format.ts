/* erp-tour-operator/frontend/src/utils/date-format.ts */

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
];

export function formatDateShortEs(value?: string | Date | null) {
  if (!value) {
    return "N/D";
  }

  const rawValue = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);

  const [year, month, day] = rawValue.split("-");

  if (!year || !month || !day) {
    return "N/D";
  }

  const monthIndex = Number(month) - 1;
  const monthName = MESES_CORTOS[monthIndex];

  if (!monthName) {
    return "N/D";
  }

  return `${day}/${monthName}/${year}`;
}

export function formatDateRangeShortEs(
  fechaDesde?: string | Date | null,
  fechaHasta?: string | Date | null
) {
  return `${formatDateShortEs(fechaDesde)} - ${formatDateShortEs(fechaHasta)}`;
}