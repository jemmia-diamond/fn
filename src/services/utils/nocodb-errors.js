export function isDuplicateRecordError(error) {
  const bodies = [
    error?.response?.data,
    error?.cause?.response?.data,
    error?.cause
  ];
  for (const data of bodies) {
    if (data && typeof data === "object") {
      if (
        data.code === "23505" ||
        data.error === "FIELD_UNIQUE_CONSTRAINT_VIOLATION" ||
        data.message === "This record already exists." ||
        /unique/i.test(`${data.error ?? ""} ${data.message ?? ""}`)
      ) {
        return true;
      }
    }
  }
  return /23505|FIELD_UNIQUE_CONSTRAINT_VIOLATION|unique constraint/i.test(
    error?.message ?? ""
  );
}
