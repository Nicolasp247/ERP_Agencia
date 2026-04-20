export const geoValidator = {
  parseOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      return undefined;
    }

    return parsed;
  }
};