export function isDuplicateRecordError(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;
  return (
    data?.code === "23505" ||
    data?.error === "FIELD_UNIQUE_CONSTRAINT_VIOLATION" ||
    data?.message === "This record already exists." ||
    ((status === 400 || status === 409) &&
      /unique/i.test(`${data?.error ?? ""} ${data?.message ?? ""}`))
  );
}
