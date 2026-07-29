// erp-torur-operator/backend/src/modules/expediente/confirmacion-builder/mapper/confirmacion-builder-date.mapper.ts

export function formatDateOnly(
  value: Date | string | null | undefined
) {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(
  value: Date | string | null | undefined
) {
  if (!value) {
    return null;
  }

  const raw =
    value instanceof Date
      ? formatDateOnly(value)
      : String(value).slice(0, 10);

  if (!raw) {
    return null;
  }

  const date = new Date(
    `${raw}T00:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function addDaysToDate(
  value: Date | string | null | undefined,
  days: number
) {
  const date = parseDateOnly(value);

  if (!date) {
    return null;
  }

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return formatDateOnly(date);
}

export function calculateAgeAtDate(
  birthValue: Date | string | null | undefined,
  targetValue: Date | string | null | undefined
) {
  const birth = parseDateOnly(birthValue);
  const target = parseDateOnly(targetValue);

  if (!birth || !target) {
    return null;
  }

  let age =
    target.getUTCFullYear() -
    birth.getUTCFullYear();

  const targetMonth = target.getUTCMonth();
  const birthMonth = birth.getUTCMonth();
  const targetDay = target.getUTCDate();
  const birthDay = birth.getUTCDate();

  if (
    targetMonth < birthMonth ||
    (
      targetMonth === birthMonth &&
      targetDay < birthDay
    )
  ) {
    age -= 1;
  }

  return age;
}

export function formatPassengerTravelAge(
  passenger: any,
  fechaInicioViaje: string | null,
  fechaFinViaje: string | null
) {
  const startAge = calculateAgeAtDate(
    passenger.fechaNacimiento,
    fechaInicioViaje
  );

  const endAge = calculateAgeAtDate(
    passenger.fechaNacimiento,
    fechaFinViaje
  );

  if (
    startAge === null ||
    endAge === null
  ) {
    return "N/D";
  }

  if (startAge === endAge) {
    return String(startAge);
  }

  return `${startAge}/${endAge}`;
}