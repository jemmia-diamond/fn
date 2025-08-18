export const safeValue = (value, type = "string") => {
  if (value === null || value === undefined || value === "") return null;
  switch (type) {
  case "number":
    if (typeof value === "number") return value;
    if (typeof value === "string" && !isNaN(Number(value))) return Number(value);
    return null;
  case "date":
    return new Date(value);
  default:
    return value;
  }
};
