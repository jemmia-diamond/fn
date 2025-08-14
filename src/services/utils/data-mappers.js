export const safeNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && !isNaN(Number(value))) return Number(value);
  return null;
};

export const safeValue = (value) => {
  return (value !== null && value !== undefined && value !== "") ? value : null;
};
